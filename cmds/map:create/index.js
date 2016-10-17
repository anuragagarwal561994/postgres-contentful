const co = require('co');
const jsonfile = require('jsonfile');
const { set, get, chain } = require('lodash');
const { exitModule, defaultString } = require('../../commander_helpers');
const toOverwrite = require('../../questions/overwrite');
const getDatabaseInformation = require('./get_database_information');
const getContentfulInformation = require('./get_contentful_information');


module.exports = (program) => {
  // exit function, on success displays message
  const exit = exitModule(program, () => {
    program.log.info('Mappings file created successfully');
  });

  /**
   * Main function of program execution
   */
  const run = co.wrap(function* exec({ output, spaces, force, schema }) {
    try {
      // get values from config
      const contentfulAccessToken = program.config.get('access_token');
      const databaseConnectionURI = program.config.get('pg_connection_uri');

      // ask to overwrite mapping file if already exists
      if (!force && (yield toOverwrite(output)).overwrite === false) {
        exit(new Error('Output file already exists'));
      }

      // collect input from user and prepare schema infromation
      const databaseInformation = yield getDatabaseInformation(databaseConnectionURI, schema);
      const contentfulInformation = yield getContentfulInformation(contentfulAccessToken);
      const { postgres, rawTableSchema } = databaseInformation;
      const { accessToken, contentTypeSchema } = contentfulInformation;

      // changes the columns field in pg schema from being object to array
      // this is done for keeping consistency with the content type schema
      // and for ease of programming
      const tableSchema = set(rawTableSchema, 'columns',
        chain(get(rawTableSchema, 'columns')).values().value()
      );

      // Prepares mappings section with keys as content type fields ids and values as null
      const contentTypeFields = contentTypeSchema.fields.map(o => o.id);
      const mappings = contentTypeFields.reduce((hash, value) => {
        set(hash, value, null);
        return hash;
      }, {});

      // final json information to be written to file
      const JSONcontent = {
        pgConnectionURI: postgres,
        accessToken,
        tableSchema,
        contentTypeSchema,
        mappings,
      };

      // write json to output file with spaces given by the user throught optional arguments
      jsonfile.writeFile(output, JSONcontent, { spaces }, exit);
    } catch (err) {
      // handle if any error is emitted in the whole process
      exit(err);
    }
  });

  // defines default values to be used and displayed in help
  const defaults = {
    output: 'mappings.json',
    spaces: 4,
  };

  // prepares program
  program
    .command('map:create')
    .version('0.0.0')
    .description('Generates postgres to contentful mapping file')
    .option(
      '-o, --output <file>',
      `output json file ${defaultString(defaults.output)}`,
      defaults.output
    )
    .option(
      '-s, --spaces <spaces>',
      `spaces to include in output file ${defaultString(defaults.spaces)}`,
      parseInt,
      defaults.spaces
    )
    .option('-f, --force', 'force overwrite of output file')
    .option('--schema <schema>', 'to choose schema other than public')
    .action(run);
};
