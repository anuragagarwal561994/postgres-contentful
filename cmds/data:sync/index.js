'use strict';

const co = require('co');
const jsonfile = require('jsonfile');
const checkMappingData = require('./check_mapping_data');

module.exports = (program) => {
    const logger = program.log;

    function exit(err) {
        if (!err) {
            logger.info('Mappings file created successfully');
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
        } catch (err) {
            exit(err);
        }
    });

    program
        .command('data:sync <file>')
        .version('0.0.0')
        .description('Synchronizes data from postgres -> contentful')
        .action(run);

};
