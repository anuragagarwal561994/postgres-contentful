const co = require('co');
const isUndefined = require('lodash/isUndefined');

const getAccessToken = require('../../questions/accessToken');
const getSpaceId = require('../../questions/spaceId');
const getContentTypeSchema = require('../../questions/contentTypeSchema');

module.exports = co.wrap(function* exec(defaultToken) {
  let accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  let spaceId = process.env.CONTENTFUL_SPACE_ID;

  if (isUndefined(accessToken)) {
    accessToken = (yield getAccessToken(defaultToken)).accessToken;
  }

  if (isUndefined(spaceId)) {
    spaceId = (yield getSpaceId(accessToken)).spaceId;
  }

  const { contentTypeSchema } = yield getContentTypeSchema(accessToken, spaceId);

  return {
    accessToken,
    spaceId,
    contentTypeSchema,
  };
});
