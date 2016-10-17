const co = require('co');
const pgp = require('pg-promise')();

/**
 * Connects to postgres database and fetches passed columns from given
 * tableName using where condition
 *
 * @param {string} connection - postgres connecting string
 * @param {string} tableName - postgres table name from where to fetch data
 * @param {string[]} columns - columns to fetch
 * @param {string} where='1=1' - where condition to query
 * @throws when any error occurs with connection or fetching data from the database
 * @return {Object[]}
 */
module.exports = co.wrap(function* exec(connection, tableName, columns, where = '1=1') {
  const db = pgp(connection);

  yield db.connect();
  const result = yield db.query(`SELECT ${columns.join(', ')} FROM ${tableName} WHERE ${where}`);
  pgp.end();

  return result;
});
