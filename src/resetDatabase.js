module.exports = resetDatabase;

const createConnection = require('./createConnection');

/**
 * scheduleテーブルをdropする。
 * @returns {Promise<void>}
 */
async function resetDatabase() {
  const knex = createConnection();
  await knex.schema.dropTableIfExists('schedules');

  /**
   * スケジュールオブジェクトの例
   * {
   *   author: 'タスクフォースT',
   *   title: '戦略ミーティング',
   *   start: 2020-02-02T10:00:00.000Z,
   *   end: 2020-02-02T12:30:00.000Z,
   *   roomTypeName: '会議室',
   *   buildingName: '建物X',
   *   roomName: '会議室A'
   * }
   */
  await knex.schema.createTable('schedules', table => {
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
