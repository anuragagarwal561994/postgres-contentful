'use strict';

const co = require('co');
const inquirer = require('inquirer');
const PostgresSchema = require('pg-json-schema-export');

function getDatabaseSchema(connectionString) {
    return PostgresSchema.toJSON(connectionString, 'public');
}

function getPostgresInformation() {
    const question = [
        {
            name: 'postgres',
            type: 'input',
            message: 'Enter your postgreSQL connection string:',
            validate(connection) {
                if (connection.length) {
                    return true;
                }
                return 'Please enter your postgreSQL connection string';
            }
        },
        {
            name: 'tableSchema',
            type: 'list',
            message: 'Choose a table name:',
            choices: co.wrap(function *getChoices({postgres}) {
                const schema = yield getDatabaseSchema(postgres);
                const tables = schema.tables;

                return Object.keys(tables).map(name => ({
                    name,
                    value: tables[name],
                }));
            }),
        },
    ];

    return inquirer.prompt(question);
}

module.exports = co.wrap(function *exec() {
    return (yield getPostgresInformation()).tableSchema;
});
