const inquirer = require('inquirer');

/**
 * Ask user for where caluse
 *
 * @returns {Promise}
 */
module.exports = () => {
  const question = {
    name: 'where',
    type: 'input',
    message: 'where:',
    default: '1=1',
  };

  return inquirer.prompt(question);
};
