const cors = require('cors');
const dayjs = require('dayjs');
const express = require('express');
const bearerToken = require('express-bearer-token');
const ICal = require('ical-generator');

const createConnection = require('./createConnection');

const API_TOKEN = process.env.API_TOKEN;
const RWIN_BASE_URL = process.env.RWIN_BASE_URL;

(async () => {
  const knex = createConnection();

  const app = express();
  const port = 3000;

  // Authorization
  app.use(bearerToken());
  app.use(cors());
  app.all('*', (req, res, next) => {
    if (req.token === API_TOKEN) {
      next();
    } else {
      res.sendStatus(401);
    }
  });

  await createIndexEndpoint(app);
  await createDatabaseEndpoints(knex, app);
  await createICalEndpoint(knex, app);

  app.listen(port, () => console.log(`Listening on port ${port} ...`));
})();

/**
 * 利用可能なエンドポイント一覧を表示するエンドポイントを作成する。
 * @param app
 * @return {Promise<void>}
 */
async function createIndexEndpoint(app) {
  app.get('/api/', async (req, res) => {
    console.log(`GET /api/`);
    const apiList = [
      'GET /api/',
      'GET /api/rooms',
      'GET /api/schedules',
      'GET /api/schedules/ical',
    ];
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

/**
 * スケジュールの iCal を返すエンドポイントを作成する。
 * @param knex
 * @param app
 * @return {Promise<void>}
 */
async function createICalEndpoint(knex, app) {
  const path = '/api/schedules/ical';
  const rwinSchedules = await knex.select('*').from('schedules');
  const ical = generateICal(rwinSchedules);

  app.get(path, async (req, res) => {
    console.log(`GET ${path}`);
    res.set('Content-Type', 'text/calendar;charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="rwin-bot.ics"');
    res.send(ical);
  });
}

/**
 * rwin-bot のデータベースのスケジュールリストから iCal のテキストデータを生成する。
 * @param {object[]} schedules
 */
function generateICal(schedules) {
  const ical = ICal({
    domain: 'rwin-bot',
    events: schedules.map(convertToICal),
  });

  return ical.toString();
}

/**
 * rwin-bot のデータベースの形式のスケジュールを iCal の形式に変換する。
 * @param {object} rwinSchedule
 * @return {{summary: string, start: Date, description: string, end: Date, location: string, url: string}}
 */
function convertToICal(rwinSchedule) {
  return {
    start: dayjs(rwinSchedule.start)
      .subtract(9, 'hour')
      .toDate(),
    end: dayjs(rwinSchedule.end)
      .subtract(9, 'hour')
      .toDate(),
    summary: rwinSchedule.title,
    description: `予約者: ${rwinSchedule.author}`,
    location: `${rwinSchedule.roomTypeName} / ${rwinSchedule.buildingName} / ${rwinSchedule.roomName}`,
    url:
      rwinSchedule.reservationID != null
        ? `${RWIN_BASE_URL}/ac_reserveedit/edit_${rwinSchedule.reservationID}`
        : '',
  };
}
