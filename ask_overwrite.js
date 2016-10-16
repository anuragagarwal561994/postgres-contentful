const fs = require('fs');
const inquirer = require('inquirer');

module.exports = (filename) => {
    let fileExists = true;

    try {
        fs.accessSync(filename, fs.F_OK);
    } catch(err) {
        fileExists = false;
    }

    const question = {
        name: 'overwrite',
        type: 'confirm',
        message: `Overwrite ${filename}:`,
        default: false,
        when: fileExists,
    };

    return inquirer.prompt(question);
};
