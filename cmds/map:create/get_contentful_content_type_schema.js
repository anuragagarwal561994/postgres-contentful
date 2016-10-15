'use strict';

const co = require('co');
const inquirer = require('inquirer');
const contentful = require('contentful');

function getContentfulInformation(accessToken) {
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
            when: !process.env.CONTENTFUL_ACCESS_TOKEN,
        },
        {
            name: 'space',
            type: 'input',
            message: 'Enter your space id:',
            validate(spaceId) {
                if (spaceId.length) {
                    return true;
                }
                return 'Please enter your space id';
            },
            when: !process.env.CONTENTFUL_SPACE_ID,
        },
        {
            name: 'contentTypeSchema',
            type: 'list',
            message: 'Choose a content type:',
            choices: co.wrap(function *getChoices(credentials) {
                Object.assign({
                    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
                    space: process.env.CONTENTFUL_SPACE_ID
                }, credentials);

                const client = contentful.createClient(credentials);
                const schema = yield client.getContentTypes();
                const contentTypes = schema.items;

                return contentTypes.map((o, index) => ({
                    name: o.name,
                    value: schema.items[index]
                }));
            }),
        },
    ];

    return inquirer.prompt(questions);
}

module.exports = co.wrap(function* exec(accessToken) {
    return (yield getContentfulInformation(accessToken)).contentTypeSchema;
});
