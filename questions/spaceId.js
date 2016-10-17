const co = require('co');
const inquirer = require('inquirer');
const rp = require('request-promise');
const endpoints = require('../contentful_endpoints');

const requestOptions = { json: true };

/**
 * Displays list of spaces available for a particular acess_token for the user to choose
 * Displays an extra option 'Other' to allow user to enter spaceId as input
 * Max limit of the list depends on the response given by the contentful api
 *
 * @param {string} accessToken - Contentful access_token
 * @returns {Promise}
 */
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

        // Maps the display text to be space name and value to be spaceId
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

        // if empty
        return 'Please enter a space id';
      },
      when({ spaceId }) {
        return spaceId === true;
      },
    },
  ];

  return inquirer.prompt(questions);
};
