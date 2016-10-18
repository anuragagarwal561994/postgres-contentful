const co = require('co');
const pgp = require('pg-promise')();

/**
 * Connects to postgres database and updates the contentful version from response
 * by contentful using connectingKey in a given table
 *
 * @param {string} connection - postgres connecting string
 * @param {string} tableName - postgres table name from where to fetch data
 * @param {Object[]} response - response of update/insert api request to contentful
 * @param {string} connectingKey - column representing common id between contentful and postgres
 * @throws when any error occurs with connection or updating data to database
 * @return {Object[]}
 */
module.exports = co.wrap(function* exec(connection, tableName, response, connectingKey) {
  const db = pgp(connection);

  const uQuery = String.raw`UPDATE "${tableName}"`;
  yield db.connect();

  // Forms and makes all requests to update database in parallel
  yield response.map((row) => {
    const { version, id } = row.sys;
    const query = `${uQuery} SET contentfulversion=${version} WHERE "${connectingKey}"='${id}'`;
    return db.query(query);
  });

  pgp.end();
});
