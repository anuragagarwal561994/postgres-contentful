const co = require('co');
const inquirer = require('inquirer');
const rp = require('request-promise');
const endpoints = require('../contentful_endpoints');

// for json response
const requestOptions = { json: true };

/**
 * Fetches list of Content Types and ask user to choose from
 * Max Limit of the Content Types displayed is the limit given by Contentful
 *
 * @param {string} accessToken - Contentful access_token
 * @param {string} spaceId - Contentful space_id
 * @returns {Promise}
 */
module.exports = (accessToken, spaceId) => {
  const question = {
    name: 'contentTypeSchema',
    type: 'list',
    message: 'Choose a content type:',
    choices: co.wrap(function* getChoices() {
      requestOptions.auth = { bearer: accessToken };
      requestOptions.uri = endpoints.CONTENT_TYPES_ENDPOINT(spaceId);

      // schema of all content types in a space
      const response = yield rp.get(requestOptions);

      // displays content type names in list with values being their respective schema
      const mapChoices = (o, index) => ({ name: o.name, value: response.items[index] });
      return response.items.map(mapChoices);
    }),
  };

  return inquirer.prompt(question);
};
