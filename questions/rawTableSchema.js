const co = require('co');
const inquirer = require('inquirer');
const PostgresSchema = require('pg-json-schema-export');
const { has, mapValues, set } = require('lodash');

/**
 * Fetches postgres schema and converts it into json
 *
 * @param {string} connectionString - postgres connection string
 * @param {string} schema='public' - schema to get the database structure from
 * @return {Promise}
 */
const getDatabaseSchema = (connectionString, schema = 'public') => PostgresSchema.toJSON(connectionString, schema);

/**
 * Displays list of tables in database and asks user to choose from it
 *
 * @param {string} schemaName - schema name to get the database structure from
 * @param {string} connectionURI - postgres connection uri
 * @returns {Promise}
 */
module.exports = (schemaName, connectionURI) => {
  const question = {
    name: 'rawTableSchema',
    type: 'list',
    message: 'Choose a table name:',
    choices: co.wrap(function* getChoices() {
      const schema = yield getDatabaseSchema(connectionURI, schemaName);

      // Merges constraints on database
      const tables = mapValues(schema.tables, (value, tableName) => {
        if (has(schema.constraints, tableName)) {
          set(value, 'constraints', schema.constraints[tableName]);
        }
        return value;
      });

      // Displays table names and answer is table schema
      return Object.keys(tables).map(name => ({
        name,
        value: tables[name],
      }));
    }),
  };

  return inquirer.prompt(question);
};
