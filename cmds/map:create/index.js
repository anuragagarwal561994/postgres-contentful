'use strict';

const jsonfile = require('jsonfile');
const async = require('../../helpers').async;
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

    const run = async(function *(file = 'mappings.json', spaces = 4) {
        try {
            const tableSchema = yield getTableSchema();
            const contentTypeSchema = yield getContentTypeSchema();
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

            jsonfile.writeFile(file, JSONcontent, {spaces}, exit);
        } catch(err) {
            exit(err);
        }
    });

    program
        .command('map:create')
        .version('0.0.0')
        .description('Generates postgres to contentful mapping file')
        .action(run);

};
