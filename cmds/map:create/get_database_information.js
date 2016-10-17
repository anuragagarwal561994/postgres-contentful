const co = require('co');
const inquirer = require('inquirer');

const askPostgres = require('../../questions/ask_postgres');
const askRawTableSchema = require('../../questions/ask_rawTableSchema');

module.exports = co.wrap(function* exec(connectionURI, schemaName) {
  const { postgres } = yield inquirer.prompt(askPostgres(connectionURI));
  const { rawTableSchema } = yield inquirer.prompt(askRawTableSchema(schemaName, postgres));

  return { postgres, rawTableSchema };
});
