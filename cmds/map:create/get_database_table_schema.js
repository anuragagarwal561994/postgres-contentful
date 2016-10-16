'use strict';

const co = require('co');
const inquirer = require('inquirer');
const PostgresSchema = require('pg-json-schema-export');

function getDatabaseSchema(connectionString) {
    return PostgresSchema.toJSON(connectionString, 'public');
}

function getPostgresInformation(connectionURI) {
    const question = [
        {
            name: 'postgres',
            type: 'input',
            message: 'Enter your postgreSQL connection string:',
            default: connectionURI,
            validate(connection) {
                if (connection.length) {
                    return true;
                }
                return 'Please enter your postgreSQL connection string';
            },
            when: !process.env.PG_CONNECTION_URI,
        },
        {
            name: 'rawTableSchema',
            type: 'list',
            message: 'Choose a table name:',
            choices: co.wrap(function *getChoices({postgres}) {
                const connection = postgres || process.env.PG_CONNECTION_URI;
                const schema = yield getDatabaseSchema(connection);
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

module.exports = co.wrap(function *exec(connectionURI) {
    return (yield getPostgresInformation(connectionURI));
});
