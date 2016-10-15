'use strict';

const co = require('co');
const jsonfile = require('jsonfile');
const getTableSchema = require('./get_database_table_schema');
const getContentTypeSchema = require('./get_contentful_content_type_schema');

module.exports = (program) => {
    const logger = program.log;

    function exit(err) {
        if (!err) {
            process.exit(0);
        }

        let errMessage = err.message;
        if (err.code) {
            errMessage = `${err.code}: ${errMessage}`;
        }

        logger.error(errMessage);
        process.exit(1);
    }

    const run = co.wrap(function *exec({output, spaces}) {
        try {
            const contentfulAccessToken = program.config.get('access_token');
            const databaseConnectionURI = program.config.get('pg_connection_uri');

            const tableSchema = yield getTableSchema(databaseConnectionURI);
            const contentTypeSchema = yield getContentTypeSchema(contentfulAccessToken);

            const contentTypeFields = contentTypeSchema.fields.map(o => o.id);
            const mappings = contentTypeFields.reduce((hash, value) => {
                hash[value] = null;
                return hash;
            }, {});

            const JSONcontent = {
                tableSchema,
                contentTypeSchema,
                mappings,
            };

            jsonfile.writeFile(output, JSONcontent, {spaces}, exit);
        } catch (err) {
            exit(err);
        }
    });

    program
        .command('map:create')
        .version('0.0.0')
        .description('Generates postgres to contentful mapping file')
        .option('-o, --output <file>', 'output json file', 'mappings.json')
        .option('-s, --spaces <spaces>', 'spaces to be used in output json file', 4)
        .action(run);

};
