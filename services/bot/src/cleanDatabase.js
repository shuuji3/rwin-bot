module.exports = cleanDatabase;

const dayjs = require('dayjs');

const createConnection = require('./createConnection');

/**
 * データベースのクリーニングを行う。
 * @returns {Promise<void>}
 */
async function cleanDatabase() {
  const knex = createConnection();
  await removeOldSchedulesFromToday(knex);
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
