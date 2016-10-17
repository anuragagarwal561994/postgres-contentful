const co = require('co');
const isUndefined = require('lodash/isUndefined');

const getPostgres = require('../../questions/postgres');
const getRawTableSchema = require('../../questions/rawTableSchema');

module.exports = co.wrap(function* exec(connectionURI, schemaName) {
  let postgres = process.env.PG_CONNECTION_URI;

  if (isUndefined(postgres)) {
    postgres = (yield getPostgres(connectionURI)).postgres;
  }

  const { rawTableSchema } = yield getRawTableSchema(schemaName, postgres);

  return { postgres, rawTableSchema };
});
