const fs = require('fs');
const inquirer = require('inquirer');

/**
 * Asks to overwrite a file if it exists
 *
 * @param {string} filename
 * @returns {Promise}
 */
module.exports = (filename) => {
  let fileExists = true;

  // check if file exists
  try {
    fs.accessSync(filename, fs.F_OK);
  } catch (err) {
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
