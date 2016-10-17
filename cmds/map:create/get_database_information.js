const co = require('co');

const getPostgres = require('../../questions/postgres');
const getRawTableSchema = require('../../questions/rawTableSchema');

module.exports = co.wrap(function* exec(connectionURI, schemaName) {
  const { postgres } = yield getPostgres(connectionURI);
  const { rawTableSchema } = yield getRawTableSchema(schemaName, postgres);

  return { postgres, rawTableSchema };
});
