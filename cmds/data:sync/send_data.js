const co = require('co');
const wait = require('co-wait');
const rp = require('request-promise');
const ProgressBar = require('progress');
const { get, keys, mapValues, pick } = require('lodash');
const endpoints = require('../../contentful_endpoints');

/**
 * Transforms data received from postgres in form accepted by Contentful
 *
 * @param {Object} row - from postgres
 * @param {string[]} fields - contentful field names from mapping file
 * @returns {Object[]}
 */
const prepareRow = (row, fields) => mapValues(pick(row, fields), column => ({ 'en-US': column }));

/**
 * Sends limit number of requests at interval of time to not hit api limit of Contentful
 *
 * @param [Promises] requests - request promises to send
 * @param {number} limit=10 - batch size
 * @param {number} time=1000 - time interval to send next bacth of requests
 * @return {Object[]}
 */
const sendRequests = co.wrap(function* exec(requests, limit = 10, time = 1000) {
  // Progress bar
  const bar = new ProgressBar('syncing [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: requests.length,
  });

  // to store the final result
  let result = [];

  /* Send limit or remaining requests in parallel untill either all promises are met
   * or an err is thrown by any request promise, on each response progress bar is increased
   */
  while (requests.length) {
    const currentResult = yield requests.splice(0, Math.min(limit, requests.length))
      .map(request => request.then((response) => {
        bar.tick();
        return response;
      }));

    // concatenate the responses
    result = [...result, ...currentResult];

    // wait for time limit for the next batch
    if (time > 0 && requests.length) {
      yield wait(time);
    }
  }

  return result;
});

/**
 * Performs tasks to prepare data and request promises to send
 *
 * @param {object} mapping - mapping file json
 * @param {object} data - postgres data transformed with contentful fields
 * @param {string} connectingKey - column representing common id between both databases in data
 * @param {string} versionKey - column representing current contactful version number in data
 * @type {Promise}
 */
module.exports = co.wrap(function* exec(mapping, data, connectingKey, versionKey) {
  // Request options to send
  const requestOptions = {
    auth: { bearer: mapping.accessToken },
    json: true,
    headers: {},
    body: { fields: {} },
  };

  // Get the resources to identify the path where entry will be inserted/updated at Contentful
  const spaceId = get(mapping, 'contentTypeSchema.sys.space.sys.id');
  const contentTypeId = get(mapping, 'contentTypeSchema.sys.id');

  const ENTRIES_ENDPOINT = endpoints.ENTRIES_ENDPOINT(spaceId);

  // Necessary header containing the ContentType to which the entry belongs
  requestOptions.headers['X-Contentful-Content-Type'] = contentTypeId;

  const contentfulFields = keys(mapping.mappings);
  const requestPromises = data.map((originalRow) => {
    requestOptions.uri = `${ENTRIES_ENDPOINT}/${originalRow[connectingKey]}`;

    if (originalRow.contentfulVersion) {
      // For updating an entry, api requires the current version of the Contentful Entry
      // Here we retrieve it from pgDatabase as we store it there
      requestOptions.headers['X-Contentful-Version'] = originalRow[versionKey];
    } else {
      // No contentful version header is required for insert operation
      delete requestOptions.headers['X-Contentful-Version'];
    }

    // fills up the body to send
    requestOptions.body.fields = prepareRow(originalRow, contentfulFields);

    return rp.put(requestOptions);
  });

  return yield sendRequests(requestPromises);
});
