'use strict';

const co = require('co');
const inquirer = require('inquirer');
const rp = require('request-promise');
const endpoints = require('../../contentful_endpoints');

function getContentfulInformation(accessToken) {
    const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
    const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
    const requestOptions = {json: true};

    const questions = [
        {
            name: 'accessToken',
            type: 'input',
            message: 'Enter your Contentful access_token:',
            default: accessToken,
            validate(accessToken) {
                if (accessToken.length) {
                    return true;
                }
                return 'Please enter your Contentful access_token';
            },
            when: !CONTENTFUL_ACCESS_TOKEN,
        },
        {
            name: 'spaceId',
            type: 'list',
            message: 'Choose a space:',
            choices: co.wrap(function *getChoices({accessToken = CONTENTFUL_ACCESS_TOKEN}) {
                requestOptions.auth = {bearer: accessToken};
                requestOptions.uri = endpoints.SPACE_ENDPOINT;

                const response = yield rp.get(requestOptions);

                const mapChoices = (o) => ({name: o.name, value: o.sys.id});
                return response.items.map(mapChoices);
            }),
            when: !CONTENTFUL_SPACE_ID,
        },
        {
            name: 'contentTypeSchema',
            type: 'list',
            message: 'Choose a content type:',
            choices: co.wrap(function *getChoices({
                accessToken = CONTENTFUL_ACCESS_TOKEN,
                spaceId = CONTENTFUL_SPACE_ID,
            }) {
                requestOptions.auth = {bearer: accessToken};
                requestOptions.uri = endpoints.CONTENT_TYPES_ENDPOINT(spaceId);

                const response = yield rp.get(requestOptions);

                const mapChoices = (o, index) => ({name: o.name, value: response.items[index]});
                return response.items.map(mapChoices);
            }),
        },
    ];

    return inquirer.prompt(questions);
}

module.exports = co.wrap(function* exec(accessToken) {
    return (yield getContentfulInformation(accessToken)).contentTypeSchema;
});
