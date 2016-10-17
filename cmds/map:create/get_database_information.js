const co = require('co');
const isUndefined = require('lodash/isUndefined');

const getPostgres = require('../../questions/postgres');
const getRawTableSchema = require('../../questions/rawTableSchema');

/**
 * Fetches database information by asking questions
 * Doesn't ask for connectionURI if already in environment variable
 *
 * @param connectionURI - postgres connectionURI from config
 * @param schemaName - schema from where to fetch the structure form command option
 *
 * @typedef {Object} DatabaseInformation
 * @property {string} postgres - connection string for db
 * @property {Object} rawTableSchema - schema of the table chosen
 *
 * @type {DatabaseInformation}
 */
module.exports = co.wrap(function* exec(connectionURI, schemaName) {
  let postgres = process.env.PG_CONNECTION_URI;

  if (isUndefined(postgres)) {
    postgres = (yield getPostgres(connectionURI)).postgres;
  }

  const { rawTableSchema } = yield getRawTableSchema(schemaName, postgres);

  return { postgres, rawTableSchema };
});
