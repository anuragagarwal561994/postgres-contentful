const jsonfile = require('jsonfile');
const { exitModule, defaultString } = require('../../commander_helpers');
const checkMappingData = require('./../map:validate/check_mapping_data');

module.exports = (program) => {
  // exit function, on success displays message
  const exit = exitModule(program, () => {
    program.log.info('Successfully validated');
  });

  /**
   * Main function of command execution
   * @param {string} filename - given as argument representing the mapping file
   * @param {string} connectingKey=externalId - column name acting as a link both databases
   */
  const run = (filename, { connectingKey }) => {
    try {
      // reads the mapping file
      const data = jsonfile.readFileSync(filename, program);

      checkMappingData(data, connectingKey);
      exit();
    } catch (err) {
      exit(err);
    }
  };

  // defines default values to be used and displayed in help
  const defaults = {
    connectingKey: 'externalId',
  };

  // prepares program
  program
    .command('map:validate <file>')
    .version('0.0.0')
    .description('Checks if mapping has a valid schema')
    .option(
      '--connecting-key <connecting_key>',
      `column to be used as connecting key ${defaultString(defaults.connectingKey)}`,
      defaults.connectingKey
    )
    .action(run);
};
