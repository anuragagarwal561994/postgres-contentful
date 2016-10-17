const inquirer = require('inquirer');

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
      return 'Please enter your Contentful access_token';
    },
    when: !process.env.CONTENTFUL_ACCESS_TOKEN,
  };

  return inquirer.prompt(question);
};
