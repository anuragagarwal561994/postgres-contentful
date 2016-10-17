const inquirer = require('inquirer');

/**
 * Asks user for postgres connectionURI if it doesn't exists in environment
 *
 * @param {string} [defaultConnectionURI] - default value stored in config
 * @returns {Promise}
 */
module.exports = (defaultConnectionURI) => {
  const question = {
    name: 'postgres',
    type: 'input',
    message: 'Enter your postgreSQL connection string:',
    default: defaultConnectionURI,
    validate(connection) {
      if (connection.trim().length) {
        return true;
      }

      // if empty
      return 'Please enter your postgreSQL connection string';
    },
    when: !process.env.PG_CONNECTION_URI,
  };

  return inquirer.prompt(question);
};
