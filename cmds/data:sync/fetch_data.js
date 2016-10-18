const co = require('co');
const pgp = require('pg-promise')();
const { has, toPairs, reject } = require('lodash');

/**
 * Connects to postgres database and fetches passed columns from given
 * tableName using where condition
 *
 * @param {string} con - postgres connecting string
 * @param {string} table - postgres table name from where to fetch data
 * @param {Object.<string,string>} columnWiseMapping - inverted column mapping from mapping file
 * @param {string[]} extraColumns - required columns to include, might not be part of columnMapping
 * @param {string} where='1=1' - where condition to query
 * @throws when any error occurs with connection or fetching data from the database
 * @return {Object[]}
 */
module.exports = co.wrap(function* exec(con, table, columnWiseMapping, extraColumns, where = '1=1') {
  const db = pgp(con);

  yield db.connect();
  const columns = [
    // to transform column names to contentful field names
    ...toPairs(columnWiseMapping).map(p => `"${p[0]}" as "${p[1]}"`),
    // to include extra columns
    ...reject(extraColumns, col => has(columnWiseMapping, col)).map(col => `"${col}"`),
  ];
  const result = yield db.query(`SELECT ${columns.join(', ')} FROM "${table}" WHERE ${where}`);
  pgp.end();

  return result;
});
