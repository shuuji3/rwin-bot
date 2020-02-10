const express = require('express');
const cors = require('cors');

const createConnection = require('./createConnection');

(async () => {
  const knex = createConnection();

  const app = express();
  const port = 3000;

  await createIndexEndpoint(app);
  await createDatabaseEndpoints(knex, app);

  app.listen(port, () => console.log(`Listening on port ${port} ...`));
})();

/**
 * データベースのデータを取得するエンドポイントを作成する。
 * @param app
 * @return {Promise<void>}
 */
async function createIndexEndpoint(app) {
  app.get('/', cors(), async (req, res) => {
    console.log(`GET /`);
    const apiList = ['GET /', 'GET /api/rooms', 'GET /api/schedules'];
    res.json(apiList);
  });
}

/**
 * データベースのデータを取得するエンドポイントを作成する。
 * @param knex
 * @param app
 * @return {Promise<void>}
 */
async function createDatabaseEndpoints(knex, app) {
  const endpoints = [
    [
      '/api/rooms',
      () =>
        knex
          .distinct('roomTypeName', 'buildingName', 'roomName')
          .from('schedules'),
    ],
    ['/api/schedules', () => knex.select('*').from('schedules')],
  ];

  for (const [path, schedules] of endpoints) {
    await addDatabaseEndpoint(app, path, schedules);
  }
}

/**
 * pathとscheduleを返す関数からエンドポイントを作成する。
 * @param app
 * @param {string} path
 * @param {Function} queryCallback
 * @return {Promise<void>}
 */
async function addDatabaseEndpoint(app, path, queryCallback) {
  app.get(path, cors(), async (req, res) => {
    console.log(`GET ${path}`);

    const schedules = await queryCallback(req);

    // Sqlite3ではDate型がUNIX時間の整数として保存されているため、Date型に戻す必要があります。
    schedules.forEach(schedule => {
      if (schedule.start != null && schedule.end != null) {
        schedule.start = new Date(schedule.start);
        schedule.end = new Date(schedule.end);
      }
    });

    res.json(schedules);
  });
}
