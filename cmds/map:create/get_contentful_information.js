const co = require('co');
const inquirer = require('inquirer');
const isUndefined = require('lodash/isUndefined');

const askAccessToken = require('../../questions/ask_accessToken');
const askSpaceId = require('../../questions/ask_spaceId');
const askContentTypeSchema = require('../../questions/ask_contentTypeSchema');

module.exports = co.wrap(function* exec(defaultToken) {
  let accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  let spaceId = process.env.CONTENTFUL_SPACE_ID;

  if (isUndefined(accessToken)) {
    accessToken = (yield inquirer.prompt(askAccessToken(defaultToken))).accessToken;
  }

  if (isUndefined(spaceId)) {
    spaceId = (yield inquirer.prompt(askSpaceId(accessToken))).spaceId;
  }

  const { contentTypeSchema } = yield inquirer.prompt(askContentTypeSchema(accessToken, spaceId));

  return {
    accessToken,
    spaceId,
    contentTypeSchema,
  };
});
