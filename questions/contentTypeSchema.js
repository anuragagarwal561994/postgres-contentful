const co = require('co');
const inquirer = require('inquirer');
const rp = require('request-promise');
const endpoints = require('../contentful_endpoints');

const requestOptions = { json: true };

module.exports = (accessToken, spaceId) => {
  const question = {
    name: 'contentTypeSchema',
    type: 'list',
    message: 'Choose a content type:',
    choices: co.wrap(function* getChoices() {
      requestOptions.auth = { bearer: accessToken };
      requestOptions.uri = endpoints.CONTENT_TYPES_ENDPOINT(spaceId);

      const response = yield rp.get(requestOptions);

      const mapChoices = (o, index) => ({ name: o.name, value: response.items[index] });
      return response.items.map(mapChoices);
    }),
  };

  return inquirer.prompt(question);
};
