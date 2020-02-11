module.exports = saveSchedulesToDatabase;

const createConnection = require('./createConnection');

/**
 * 与えられたスケジュールをデータベースに保存する。
 * @param {object[]} schedules
 */
async function saveSchedulesToDatabase(schedules) {
  const knex = createConnection();
  await knex.batchInsert('schedules', schedules);
  console.log(schedules)
}
