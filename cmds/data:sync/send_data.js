const co = require('co');
const wait = require('co-wait');
const rp = require('request-promise');
const ProgressBar = require('progress');
const {get, invert, mapKeys, mapValues} = require('lodash');
const endpoints = require('../../contentful_endpoints');

const exchangeKeyValuePairs = (object) => fromPairs(toPairs(object).map(pair => pair.reverse()));

function prepareData(data, mapping) {
    const reverseMapping = invert(mapping);
    const convertToContentTypeFields = row => mapKeys(row, (value, key) => reverseMapping[key]);
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

    const result = [];
    while (requests.length) {
        const currentResult = yield requests.splice(0, Math.min(limit, requests.length))
            .map(request => request.then(() => bar.tick()));
        Array.prototype.push.apply(result, currentResult);
        if (time > 0 && requests.length) {
            yield wait(time);
        }
    }
    return result;
});

module.exports = co.wrap(function *exec(mapping, data) {
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
    const requestPromises = dataToSend.map((row) => {
        requestOptions.body.fields = row;
        requestOptions.uri = `${ENTRIES_ENDPOINT}/${row.externalId['en-US']}`;
        return rp.put(requestOptions);
    });

    return yield sendRequests(requestPromises);
});
