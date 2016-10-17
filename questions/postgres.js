const inquirer = require('inquirer');

module.exports = (connectionURI) => {
  const question = {
    name: 'postgres',
    type: 'input',
    message: 'Enter your postgreSQL connection string:',
    default: connectionURI,
    validate(connection) {
      if (connection.trim().length) {
        return true;
      }
      return 'Please enter your postgreSQL connection string';
    },
    when: !process.env.PG_CONNECTION_URI,
  };

  return inquirer.prompt(question);
};
