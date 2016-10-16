'use strict';

const co = require('co');
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const jsonfile = require('jsonfile');
const {set, get, chain, omit} = require('lodash');
const exitModule = require('../../exit');
const getDatabaseInformation = require('./get_database_information');
const getContentfulInformation = require('./get_contentful_information');

function overwriteFile(filename) {
    const question = {
        name: 'overwrite',
        type: 'confirm',
        message: `Overwrite ${filename}:`,
        default: false,
        when: fs.statSync(filename).isFile(),
    };

    return inquirer.prompt(question);
}

module.exports = (program) => {
    const exit = exitModule(program, () => {
        program.log.info('Mappings file created successfully');
    });

    const run = co.wrap(function *exec({output, spaces, force, schema}) {
        try {
            const contentfulAccessToken = program.config.get('access_token');
            const databaseConnectionURI = program.config.get('pg_connection_uri');

            if (!force) {
                const {overwrite} = yield overwriteFile(output);

                if (overwrite === false) {
                    exit(new Error('Output file already exists'));
                }
            }

            const databaseInformation = yield getDatabaseInformation(databaseConnectionURI, schema);
            const contentfulInformation = yield getContentfulInformation(contentfulAccessToken);
            const {postgres, rawTableSchema} = databaseInformation;
            const {accessToken, contentTypeSchema} = contentfulInformation;
            const tableSchema = set(rawTableSchema, 'columns',
                chain(get(rawTableSchema, 'columns'))
                    .values()
                    .map(o => omit(o, ['table_schema', 'table_name']))
                    .value()
            );

            const pgConnectionURI = postgres || process.env.PG_CONNECTION_URI;
            const contentTypeFields = contentTypeSchema.fields.map(o => o.id);
            const mappings = contentTypeFields.reduce((hash, value) => {
                hash[value] = null;
                return hash;
            }, {});

            const JSONcontent = {
                pgConnectionURI,
                accessToken,
                tableSchema,
                contentTypeSchema,
                mappings,
            };

            jsonfile.writeFile(output, JSONcontent, {spaces}, exit);
        } catch (err) {
            exit(err);
        }
    });

    const defaults = {
        output: 'mappings.json',
        spaces: 4,
    };
    const defaultString = (value) => chalk.cyan(`[default: ${value}]`);

    program
        .command('map:create')
        .version('0.0.0')
        .description('Generates postgres to contentful mapping file')
        .option(
            '-o, --output <file>',
            `output json file ${defaultString(defaults.output)}`,
            defaults.output
        )
        .option(
            '-s, --spaces <spaces>',
            `spaces to include in output file ${defaultString(defaults.spaces)}`,
            parseInt,
            defaults.spaces
        )
        .option('-f, --force', 'force overwrite of output file')
        .option('--schema <schema>', 'to choose schema other than public')
        .action(run);

};
