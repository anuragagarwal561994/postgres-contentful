'use strict';

const inquirer = require('inquirer');
const PostgresSchema = require('pg-json-schema-export');

function getTableName(schema) {
    const question = {
        name: 'table_name',
        type: 'list',
        message: 'Choose a table name:',
        choices: Object.keys(schema.tables),
    };

    return inquirer.prompt(question);
}

function getDatabaseSchema({postgres}) {
    return PostgresSchema.toJSON(postgres, 'public');
}

function getDatabaseInformation() {
    const question = {
        name: 'postgres',
        type: 'input',
        message: 'Enter your postgreSQL connection string:',
        validate(databaseConnectionString) {
            if (databaseConnectionString.length) {
                return true;
            }
            return 'Please enter your postgreSQL connection string';
        }
    };

    return inquirer.prompt(question);
}

module.exports = (program) => {
    const logger = program.log;

    function run() {
        getDatabaseInformation()
            .then(getDatabaseSchema)
            .then(getTableName)
            .then(console.log)
            .then(exit)
            .catch(exit);
    }

    function exit(err) {
        if (!err) {
            process.exit(0);
        }

        logger.error(`${err.code}: ${err.message}`);
        process.exit(1);
    }

    program
        .command('map:create')
        .version('0.0.0')
        .description('Generates postgres to contentful mapping file')
        .action(run);

};
