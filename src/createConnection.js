module.exports = createConnection;

/**
 * データベースへのコネクションを作成する。
 * @returns {Knex<any, any[]>}
 */
function createConnection() {
  return require('knex')({
    client: 'sqlite3',
    connection: {
      filename: 'db.sqlite3',
    },
    useNullAsDefault: true,
  });
}
