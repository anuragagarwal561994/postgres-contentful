'use strict';

const co = require('co');
const inquirer = require('inquirer');
const contentful = require('contentful');

function getContentTypeInformation(contentfulSchema) {
    const contentTypes = contentfulSchema.items;
    const question = {
        name: 'contentTypeIndex',
        type: 'list',
        message: 'Choose a content type:',
        choices: contentTypes.map((o, index) => ({name: o.name, value: index})),
    };

    return inquirer.prompt(question);
}

function getContentfulSchema(contentfulCredentials) {
    const client = contentful.createClient(contentfulCredentials);
    return client.getContentTypes();
}

function getContentfulCredentials() {
    const questions = [
        {
            name: 'accessToken',
            type: 'input',
            message: 'Enter your Contentful access_token:',
            validate(accessToken) {
                if (accessToken.length) {
                    return true;
                }
                return 'Please enter your Contentful access_token';
            }
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
            }
        },
    ];

    return inquirer.prompt(questions);
}

module.exports = co.wrap(function* exec() {
    const contentfulCredentials = yield getContentfulCredentials();
    const contentfulSchema = yield getContentfulSchema(contentfulCredentials);
    const {contentTypeIndex} = yield getContentTypeInformation(contentfulSchema);

    return contentfulSchema.items[contentTypeIndex];
});
