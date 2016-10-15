'use strict';

const getTableSchema = require('./get_database_table_schema');

module.exports = (program) => {
    const logger = program.log;

    function exit(err) {
        if (!err) {
            process.exit(0);
        }

        logger.error(`${err.code}: ${err.message}`);
        process.exit(1);
    }

    function run() {
        getTableSchema()
            .then(console.log)
            .then(exit)
            .catch(exit);
    }

    program
        .command('map:create')
        .version('0.0.0')
        .description('Generates postgres to contentful mapping file')
        .action(run);

};
