const co = require('co');
const isUndefined = require('lodash/isUndefined');

const getAccessToken = require('../../questions/accessToken');
const getSpaceId = require('../../questions/spaceId');
const getContentTypeSchema = require('../../questions/contentTypeSchema');

/**
 * Fetches contentful information by asking questions
 * Doesn't ask for access_token, spaceId if already in environment variable
 *
 * @param {string} [defaultToken] - contentful access_token from config
 *
 * @typedef {Object} ContentfulInformation
 * @property {string} accessToken - contentful access_token
 * @property {string} spaceId - contentful space id chosen by user
 * @property {Object} contentTypeSchema - schema of contentful content type chosen by user
 *
 * @type {ContentfulInformation}
 */
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
