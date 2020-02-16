#!/usr/bin/env node

const Queue = require('bull');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');

const runRegisterSchedule = require('./runRegisterSchedule');

(async () => {
  await main();
})();

async function main() {
  // Setup queues
  const saveSchedulesQueue = new Queue('save-schedules', 'redis://redis');

  saveSchedulesQueue.process(path.resolve('src/runSaveSchedules.js'));

  // Setup server
  const app = express();
  app.use(bodyParser.json()); // for parsing application/json
  const port = 3001;

  createIndexEndpoint(app);
  createSaveSchedulesEndpoint(app, saveSchedulesQueue);
  createRegisterScheduleEndpoint(app);

  app.listen(port, () => console.log(`Listening on port ${port} ...`));
}

/**
 * 利用可能なエンドポイント一覧を表示するエンドポイントを作成する。
 * @param app
 * @return {void}
 */
function createIndexEndpoint(app) {
  app.get('/api/', cors(), async (req, res) => {
    console.log(`GET /api/`);
    const apiList = [
      'GET /api/',
      'POST /api/save-schedules',
      'POST /api/register-schedule',
    ];
    res.json(apiList);
  });
}

/**
 * 最新の予定を保存するリクエストを受けるエンドポイントを作成する。
 * @param app
 * @param {Queue} saveSchedulesQueue
 * @return {void}
 */
function createSaveSchedulesEndpoint(app, saveSchedulesQueue) {
  app.post('/api/save-schedules', cors(), async (req, res) => {
    console.log(`GET /api/save-schedules`);

    saveSchedulesQueue.add();

    res.send('accepted save-schedules request');
  });
}

/**
 * 最新の予定を保存するリクエストを受けるエンドポイントを作成する。
 * @param app
 * @return {void}
 */
function createRegisterScheduleEndpoint(app) {
  app.post('/api/register-schedule', cors(), async (req, res) => {
    console.log(`GET /api/register-schedule`);
    req.accepts('json');

    const newSchedule = req.body;
    console.log('[createRegisterScheduleEndpoint] newSchedule', newSchedule);
    const { success, message } = await runRegisterSchedule(newSchedule);

    res.json({ success, message });
  });
}
