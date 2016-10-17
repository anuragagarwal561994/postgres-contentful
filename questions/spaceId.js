const co = require('co');
const inquirer = require('inquirer');
const rp = require('request-promise');
const endpoints = require('../contentful_endpoints');

const requestOptions = { json: true };

module.exports = (accessToken) => {
  const questions = [
    {
      name: 'spaceId',
      type: 'list',
      message: 'Choose a space:',
      choices: co.wrap(function* getChoices() {
        requestOptions.auth = { bearer: accessToken };
        requestOptions.uri = endpoints.SPACE_ENDPOINT;

        const response = yield rp.get(requestOptions);

        const mapChoices = o => ({ name: o.name, value: o.sys.id });
        return [...response.items.map(mapChoices), { name: 'Other', value: true }];
      }),
      when: !process.env.CONTENTFUL_SPACE_ID,
    },
    {
      name: 'spaceId',
      type: 'input',
      message: 'Enter a space id:',
      validate(value) {
        if (value.trim().length) {
          return true;
        }

        return 'Please enter a space id';
      },
      when({ spaceId }) {
        return spaceId === true;
      },
    },
  ];

  return inquirer.prompt(questions);
};
