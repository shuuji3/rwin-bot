const express = require('express');

const createConnection = require('./createConnection');

(async () => {
  const knex = createConnection();

  const app = express();
  const port = 3000;

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
    await createEndpoint(app, path, schedules);
  }

  app.listen(port, () => console.log(`Listening on port ${port} ...`));
})();

/**
 * pathとscheduleを返す関数からエンドポイントを作成する。
 * @param app
 * @param {string} path
 * @param {Function} queryCallback
 * @returns {Promise<void>}
 */
async function createEndpoint(app, path, queryCallback) {
  app.get(path, async (req, res) => {
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
