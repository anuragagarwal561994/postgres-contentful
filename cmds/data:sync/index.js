const co = require('co');
const jsonfile = require('jsonfile');
const { has, invert } = require('lodash');
const { exitModule, defaultString } = require('../../commander_helpers');
const toOverwrite = require('../../questions/overwrite');
const checkMappingData = require('./check_mapping_data');
const fetchData = require('./fetch_data');
const sendData = require('./send_data');
const updateDB = require('./update_db');

module.exports = (program) => {
  // exit function, on success displays message
  const exit = exitModule(program, () => {
    program.log.info('Completed transfer');
  });

  /**
   * Main function of command execution
   * @param {string} filename - given as argument representing the mapping file
   */
  const run = co.wrap(function* exec(filename, { validate, log, connectingKey, where }) {
    try {
      // reads the mapping file
      const data = jsonfile.readFileSync(filename, program);

      // if log option is enabled checks if the log file specified already exists
      // prompts the user to choose to overwrite the log file
      if (log && (yield toOverwrite(log)).overwrite === false) {
        exit(new Error('Log file already exists'));
      }

      // validates the mapping file when --no-validate option is not used
      if (validate) {
        checkMappingData(data, connectingKey);
      }

      const iMapping = invert(data.mappings);
      const versionKey = 'contentfulversion';

      // gets the postgres data from the database using information from mapping file
      const pgData = yield fetchData(
        data.pgConnectionURI,
        data.tableSchema.table_name,
        iMapping,
        [connectingKey, versionKey],
        where
      );

      // get connectingKey and versionKey as represented in data got from postgres
      // these keys will be same if was not included in mappings else they will
      // have the names of the mapped field names
      const pConnectingKey = has(iMapping, connectingKey) ? iMapping[connectingKey] : connectingKey;
      const pVersionKey = has(iMapping, versionKey) ? iMapping[versionKey] : versionKey;

      // sends data and receives response from contentful
      const response = yield sendData(data, pgData, pConnectingKey, pVersionKey);

      // updates content version in database from response sent by contentful
      yield updateDB(
        data.pgConnectionURI,
        data.tableSchema.table_name,
        response,
        connectingKey
      );

      // if log file is given, response is logged to log file given
      if (log) {
        jsonfile.writeFile(log, response, { spaces: 4 }, exit);
      } else {
        exit();
      }
    } catch (err) {
      exit(err);
    }
  });

  // defines default values to be used and displayed in help
  const defaults = {
    connectingKey: 'externalid',
  };

  // prepares program
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
