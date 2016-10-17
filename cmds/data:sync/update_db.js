const co = require('co');
const pgp = require('pg-promise')();

module.exports = co.wrap(function* exec(connection, tableName, response, connectingKey) {
  const db = pgp(connection);

  const uQuery = String.raw`UPDATE ${tableName}`;
  yield db.connect();
  yield response.map((row) => {
    const { version, id } = row.sys;
    const query = `${uQuery} SET contentfulversion=${version} WHERE ${connectingKey}='${id}'`;
    return db.query(query);
  });
  pgp.end();
});
