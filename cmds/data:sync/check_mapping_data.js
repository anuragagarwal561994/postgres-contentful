const {chain, isPlainObject, map, reject, values} = require('lodash');
const Joi = require('joi');

const stringValidation = Joi.string().trim().empty();
const isJoiObject = item => isPlainObject(item) && item.isJoi === true && item._type === 'object';
const objectValidation = (o) => {
    const requiredKeys = reject(Object.keys(o), isJoiObject).concat('');
    return Joi.object(o).unknown().requiredKeys(requiredKeys);
};

const contentFieldSchema = objectValidation({
    id: stringValidation,
    name: stringValidation,
    type: stringValidation,
    localized: Joi.boolean(),
    required: Joi.boolean(),
    disabled: Joi.boolean(),
    omitted: Joi.boolean(),
    validations: Joi.array(),
});

const columnSchema = objectValidation({
    column_name: stringValidation,
    is_nullable: Joi.boolean(),
    data_type: stringValidation,
    col_description: stringValidation.allow(null),
    column_default: Joi.any().allow(null),
});

const schema = objectValidation({
    pgConnectionURI: stringValidation,
    accessToken: Joi.string().token().concat(stringValidation),
    tableSchema: objectValidation({
        table_schema: stringValidation,
        table_name: stringValidation,
        obj_description: stringValidation.allow(null),
        columns: Joi.array().items(columnSchema),
    }),
    contentTypeSchema: objectValidation({
        sys: objectValidation({
            space: objectValidation({
                sys: objectValidation({
                    id: stringValidation,
                    type: stringValidation.equal('Link'),
                    linkType: stringValidation.equal('Space'),
                }),
            }),
            id: stringValidation,
            type: stringValidation.equal('ContentType'),
        }),
        fields: Joi.array().items(contentFieldSchema),
    }),
    mappings: Joi.object().min(1).pattern(/.*/, stringValidation),
});

function getFirstDifferent(values, testWith) {
    return chain(values).difference(testWith).first().value();
}

function checkMappingValues(mapping) {
    const columns = map(mapping.tableSchema.columns, 'column_name');
    const invalidColumn = getFirstDifferent(values(mapping.mappings), columns);

    if (invalidColumn) {
        throw new Error(`${invalidColumn} column does not exists in db`);
    }
}

function checkMappingKeys(mapping) {
    const contentFields = map(mapping.contentTypeSchema.fields, 'id');
    const invalidContentField = getFirstDifferent(mapping.mappings, contentFields);

    if (invalidContentField) {
        throw new Error(`${invalidContentField} content field does not exists`);
    }
}

module.exports = (mapping) => {
    const result = schema.validate(mapping);
    if (result.error) throw result.error;
    checkMappingValues(mapping);
    checkMappingKeys(mapping);
};
