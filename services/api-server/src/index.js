const express = require('express');

const createConnection = require('./createConnection');

(async () => {
  const knex = createConnection();
  const schedules = await knex.select('*').from('schedules');

  // Sqlite3ではDate型がUNIX時間の整数として保存されているため、Date型に戻す必要があります。
  schedules.forEach(schedule => {
    schedule.start = new Date(schedule.start);
    schedule.end = new Date(schedule.end);
  });

  const app = express();
  const port = 3000;

  app.get('/api/schedules.json', (req, res) => res.json(schedules));

  app.listen(port, () => console.log(`Listening on port ${port} ...`));
})();
