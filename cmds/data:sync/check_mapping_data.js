const _ = require('lodash');

function checkKeys(mapping) {
    const keysToCheck = [
        'pgConnectionURI',
        'tableSchema',
        'tableSchema.table_schema',
        'tableSchema.columns',
        'contentTypeSchema',
        'contentTypeSchema.fields',
        'mappings',
    ];

    const isMissing = (key) => !_.has(mapping, key);
    const missingElement = _.find(keysToCheck, isMissing);

    if (missingElement) {
        throw new Error(`${missingElement} missing`);
    }

    const isEmpty = (key) => _.isEmpty(_.result(mapping, key));
    const emptyElement = _.find(keysToCheck, isEmpty);

    if (emptyElement) {
        throw new Error(`${emptyElement} is empty`);
    }
}

function checkKeyTypes(mapping) {
    const types = {
        'object': _.isPlainObject,
        'array': _.isArray,
    };

    const toCheck = {
        'tableSchema.columns': 'object',
        'contentTypeSchema.fields': 'array',
        'mappings': 'object',
    };

    _.keys(toCheck).forEach((key) => {
        const value = _.result(mapping, key);
        if (!types[toCheck[key]](value)) {
            throw new Error(`${key} should be ${toCheck[key]}`);
        }
    });
}

function checkMappingValues(mapping) {
    let isInvalidColumn = (value) => !_.isString(value);
    let invalidColumn = _.findKey(mapping.mappings, isInvalidColumn);

    if (invalidColumn) {
        const value = mapping.mappings[invalidColumn];
        throw new Error(`${invalidColumn} has a non string value (${value}) in mappings`);
    }

    isInvalidColumn = (value) => !_.has(mapping.tableSchema.columns, value);
    invalidColumn = _.findKey(mapping.mappings, isInvalidColumn);

    if (invalidColumn) {
        const value = mapping.mappings[invalidColumn];
        throw new Error(`${invalidColumn} has a value (${value}) with non existent column in db`);
    }
}

function checkMappingKeys(mapping) {
    const contentFields = _.map(mapping.contentTypeSchema.fields, 'id');
    const invalidContentField = _
        .chain(mapping.mappings)
        .keys()
        .difference(contentFields)
        .first()
        .value();

    if (invalidContentField) {
        throw new Error(`${invalidContentField} content field does not exists`);
    }
}

module.exports = (mapping) => {
    checkKeys(mapping);
    checkKeyTypes(mapping);
    checkMappingValues(mapping);
    checkMappingKeys(mapping);
};
