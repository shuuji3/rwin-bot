module.exports = cleanDatabase;

const dayjs = require('dayjs');

const createConnection = require('./createConnection');

/**
 * データベースのクリーニングを行う。
 * @returns {Promise<void>}
 */
async function cleanDatabase() {
  const knex = createConnection();
  await createTableIfNotExists(knex);
  await removeOldSchedulesFromToday(knex);
}

/**
 * テーブルが存在しない場合に作成する。
 *
 * Ref. スケジュールオブジェクトの例
 * {
 *   author: 'タスクフォースT',
 *   title: '戦略ミーティング',
 *   start: 2020-02-02T10:00:00.000Z,
 *   end: 2020-02-02T12:30:00.000Z,
 *   roomTypeName: '会議室',
 *   buildingName: '建物X',
 *   roomName: '会議室A'
 * }
 *
 * @param {Knex} knex
 * @return {Promise<void>}
 */
async function createTableIfNotExists(knex) {
  const exists = await knex.schema.hasTable('schedules');
  if (!exists) {
    await knex.schema.createTableIfNotExists('schedules', table => {
      table.increments('id');
      table.string('author');
      table.string('title');
      table.dateTime('start');
      table.dateTime('end');
      table.string('roomTypeName');
      table.string('buildingName');
      table.string('roomName');
    });
  }
}

/**
 * 最新の情報を保存するために今日以降のスケジュールを削除する。
 * 機能以前のスケジュールは残しておくために削除しない。
 * @param {Knex} knex
 * @return {Promise<void>}
 */
async function removeOldSchedulesFromToday(knex) {
  const today = dayjs(dayjs().format('YYYY-MM-DD'));
  /**
   * 今日の00:00時点のUNIX時間。
   * @type {number}
   */
  const timeOfToday = today.toDate().getTime();

  await knex('schedules')
    .where('start', '>=', timeOfToday)
    .del();
}
