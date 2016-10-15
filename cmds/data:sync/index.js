'use strict';

const co = require('co');

module.exports = (program) => {

    const run = co.wrap(function *exec() {

    });

    program
        .command('data:sync')
        .version('0.0.0')
        .description('Synchronizes data from postgres -> contentful')
        .action(run);

};
