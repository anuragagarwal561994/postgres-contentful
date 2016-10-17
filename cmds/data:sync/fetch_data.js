const co = require('co');
const pgp = require('pg-promise')();

module.exports = co.wrap(function *exec(connection, tableName, columns, where = '1=1') {
  const db = pgp(connection);

  yield db.connect();
  const result = yield db.query(`SELECT ${columns.join(', ')} FROM ${tableName} WHERE ${where}`);
  pgp.end();

  return result;
});
