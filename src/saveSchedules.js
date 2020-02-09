module.exports = saveSchedules;

const createConnection = require('./createConnection');

/**
 * 与えられたスケジュールをデータベースに保存する。
 * @param {object[]} schedules
 */
async function saveSchedules(schedules) {
  const knex = createConnection();

  await knex.batchInsert('schedules', schedules);
}
