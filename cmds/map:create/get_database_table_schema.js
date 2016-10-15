'use strict';

const inquirer = require('inquirer');
const PostgresSchema = require('pg-json-schema-export');
const async = require('../../helpers').async;

function getTableInformation(schema) {
    const tables = schema.tables;
    const question = {
        name: 'tableName',
        type: 'list',
        message: 'Choose a table name:',
        choices: Object.keys(tables),
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

module.exports = async(function *() {
    const schema = yield getDatabaseInformation().then(getDatabaseSchema);
    const { tableName } = yield getTableInformation(schema);

    return schema.tables[tableName];
});
