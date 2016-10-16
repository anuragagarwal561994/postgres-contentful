'use strict';

const co = require('co');
const jsonfile = require('jsonfile');
const {uniq, values} = require('lodash');
const checkMappingData = require('./check_mapping_data');
const fetchData = require('./fetch_data');

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

    const run = co.wrap(function *exec(filename) {
        try {
            const data = jsonfile.readFileSync(filename);
            checkMappingData(data);

            const pgData = yield fetchData(
                data.pgConnectionURI,
                data.tableSchema.table_name,
                uniq(values(data.mappings))
            );

            console.log(pgData);

            exit();
        } catch (err) {
            exit(err);
        }
    });

    program
        .command('data:sync <file>')
        .version('0.0.0')
        .description('Synchronizes data from postgres -> contentful')
        .option('--where <where_clause>', 'query data to sync')
        .action(run);

};
