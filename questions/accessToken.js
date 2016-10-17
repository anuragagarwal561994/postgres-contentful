const inquirer = require('inquirer');

/**
 * Ask user for accessToken when not given as environment variable
 *
 * @param {string} [defaultToken] - to display the default access token stored in config
 * @returns {Promise}
 */
module.exports = (defaultToken) => {
  const question = {
    name: 'accessToken',
    type: 'input',
    message: 'Enter your Contentful access_token:',
    default: defaultToken,
    validate(value) {
      if (value.trim().length) {
        return true;
      }

      // if empty
      return 'Please enter your Contentful access_token';
    },
    when: !process.env.CONTENTFUL_ACCESS_TOKEN,
  };

  return inquirer.prompt(question);
};
