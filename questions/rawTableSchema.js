const co = require('co');
const inquirer = require('inquirer');
const PostgresSchema = require('pg-json-schema-export');
const { has, mapValues, set } = require('lodash');

const getDatabaseSchema = (connectionString, schema = 'public') => PostgresSchema.toJSON(connectionString, schema);

module.exports = (schemaName, postgres) => {
  const question = {
    name: 'rawTableSchema',
    type: 'list',
    message: 'Choose a table name:',
    choices: co.wrap(function* getChoices() {
      const connection = postgres || process.env.PG_CONNECTION_URI;
      const schema = yield getDatabaseSchema(connection, schemaName);

      const tables = mapValues(schema.tables, (value, tableName) => {
        if (has(schema.constraints, tableName)) {
          set(value, 'constraints', schema.constraints[tableName]);
        }
        return value;
      });

      return Object.keys(tables).map(name => ({
        name,
        value: tables[name],
      }));
    }),
  };

  return inquirer.prompt(question);
};
