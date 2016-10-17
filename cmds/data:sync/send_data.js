const co = require('co');
const wait = require('co-wait');
const rp = require('request-promise');
const ProgressBar = require('progress');
const {get, invert, mapKeys, mapValues, pick} = require('lodash');
const endpoints = require('../../contentful_endpoints');

function prepareData(data, mapping) {
  const reverseMapping = invert(mapping);
  const columns = Object.keys(reverseMapping);
  const convertToContentTypeFields = row => mapKeys(
    pick(row, columns),
    (value, key) => reverseMapping[key]
  );
  const addLocaleKey = value => ({'en-US': value});
  return data.map(convertToContentTypeFields)
    .map(column => mapValues(column, addLocaleKey));
}

const sendRequests = co.wrap(function *exec(requests, limit = 10, time = 1000) {
  const bar = new ProgressBar('syncing [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: requests.length
  });

  let result = [];
  while (requests.length) {
    const currentResult = yield requests.splice(0, Math.min(limit, requests.length))
      .map(request => request.then((response) => {
        bar.tick();
        return response;
      }));
    result = [...result, ...currentResult];
    if (time > 0 && requests.length) {
      yield wait(time);
    }
  }
  return result;
});

module.exports = co.wrap(function *exec(mapping, data, connectingKey) {
  const requestOptions = {
    auth: {bearer: mapping.accessToken},
    json: true,
    headers: {},
    body: {fields: {}},
  };

  const spaceId = get(mapping, 'contentTypeSchema.sys.space.sys.id');
  const contentTypeId = get(mapping, 'contentTypeSchema.sys.id');

  const ENTRIES_ENDPOINT = endpoints.ENTRIES_ENDPOINT(spaceId);
  requestOptions.headers['X-Contentful-Content-Type'] = contentTypeId;

  const dataToSend = prepareData(data, mapping.mappings);
  const requestPromises = data.map((originalRow, index) => {
    requestOptions.body.fields = dataToSend[index];
    requestOptions.uri = `${ENTRIES_ENDPOINT}/${originalRow[connectingKey]}`;
    if (originalRow.contentfulversion) {
      requestOptions.headers['X-Contentful-Version'] = originalRow.contentfulversion;
    } else {
      delete requestOptions.headers['X-Contentful-Version'];
    }
    return rp.put(requestOptions);
  });

  return yield sendRequests(requestPromises);
});
