const co = require('co');
const jsonfile = require('jsonfile');
const { uniq, values } = require('lodash');
const { exitModule, defaultString } = require('../../commander_helpers');
const toOverwrite = require('../../questions/overwrite');
const checkMappingData = require('./check_mapping_data');
const fetchData = require('./fetch_data');
const sendData = require('./send_data');
const updateDB = require('./update_db');

module.exports = (program) => {
  const exit = exitModule(program, () => {
    program.log.info('Completed transfer');
  });

  const run = co.wrap(function* exec(filename, { validate, log, connectingKey, where }) {
    try {
      const data = jsonfile.readFileSync(filename, program);

      if (log && (yield toOverwrite(log)).overwrite === false) {
        exit(new Error('Log file already exists'));
      }

      if (validate) {
        checkMappingData(data, connectingKey);
      }

      const pgData = yield fetchData(
        data.pgConnectionURI,
        data.tableSchema.table_name,
        uniq([connectingKey, 'contentfulversion', ...values(data.mappings)]),
        where
      );

      const response = yield sendData(data, pgData, connectingKey);
      yield updateDB(
        data.pgConnectionURI,
        data.tableSchema.table_name,
        response,
        connectingKey
      );

      if (log) {
        jsonfile.writeFile(log, response, { spaces: 4 }, exit);
      } else {
        exit();
      }
    } catch (err) {
      exit(err);
    }
  });

  const defaults = {
    connectingKey: 'externalid',
  };

  program
    .command('data:sync <file>')
    .version('0.0.0')
    .description('Synchronizes data from postgres -> contentful')
    .option('--where <where_clause>', 'query data to sync')
    .option('--no-validate', 'to not validate the schema file')
    .option(
      '--connecting-key <connecting_key>',
      `column to be used as connecting key ${defaultString(defaults.connectingKey)}`,
      defaults.connectingKey
    )
    .option('--log <log_file>', 'file to log response to')
    .action(run);
};
