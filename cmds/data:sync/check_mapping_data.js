const { chain, get, isPlainObject, map, reject, values } = require('lodash');
const Joi = require('joi');

// Custom string validation representing a non empty, blank string
const stringValidation = Joi.string().trim().empty();

// checks if an item is a joi object type
const isJoiObject = item => isPlainObject(item) && item.isJoi === true && get(item, '_type') === 'object';

// Custom string validation representing objects to have unknown keys and
// all values must be required along with the object itself
const objectValidation = (o) => {
  const requiredKeys = [...reject(Object.keys(o), isJoiObject), ''];
  return Joi.object(o).unknown().requiredKeys(requiredKeys);
};

// ContentField Schema
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

// Postgres Column Schema
const columnSchema = objectValidation({
  table_schema: stringValidation,
  table_name: stringValidation,
  column_name: stringValidation,
  is_nullable: Joi.boolean(),
  data_type: stringValidation,
  col_description: stringValidation.allow(null),
  column_default: Joi.any().allow(null),
});

// Mapping schema
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

/**
 * Returns the first different element in toTest when compared with toWith
 *
 * @param {Array} toTest - array to test
 * @param {Array} testWith - array to test with
 * @returns {*}
 */
function getFirstDifferent(toTest, testWith) {
  return chain(toTest).difference(testWith).first().value();
}

/**
 * Check the mapping for required columns that will be required by the schema
 *
 * @param {string[]} columns - columns to testOn
 * @param {Object} mapping - mapping file json
 *
 * @throws Will throw an error if any required column is not present in the mapping
 */
function checkRequiredColumns(columns, mapping) {
  const columnsPresent = map(mapping.tableSchema.columns, 'column_name');
  const absentRequiredColumn = getFirstDifferent(columns, columnsPresent);

  if (absentRequiredColumn) {
    throw new Error(`${absentRequiredColumn} column missing in database`);
  }
}

/**
 * Check if mapping has values representing valid columns of postgres db
 *
 * @param {Object} mapping - user defined contentful to postgres mapping
 * @throws if a value does not represent a column in db
 */
function checkMappingValues(mapping) {
  const columns = map(mapping.tableSchema.columns, 'column_name');
  const invalidColumn = getFirstDifferent(values(mapping.mappings), columns);

  if (invalidColumn) {
    throw new Error(`${invalidColumn} column does not exists in db`);
  }
}

/**
 * Check if mapping has keys representing valid ContentFields of Contentful
 *
 * @param {Object} mapping - user defined contentful to postgres mapping
 * @throws if a key does not represent a ContentField in a given ContentType of given Space
 */
function checkMappingKeys(mapping) {
  const contentFields = map(mapping.contentTypeSchema.fields, 'id');
  const invalidContentField = getFirstDifferent(mapping.mappings, contentFields);

  if (invalidContentField) {
    throw new Error(`${invalidContentField} content field does not exists`);
  }
}

/**
 * Validates the mapping file to check if it is suitable for further process
 *
 * @param {Object} mapping - mapping form the mapping file
 * @param {string} connectingKey - column representing common id between both databases
 * @throws if mapping file does not pass validation checks
 */
module.exports = (mapping, connectingKey) => {
  const result = schema.validate(mapping);
  if (result.error) throw result.error;
  checkRequiredColumns([connectingKey, 'contentfulversion'], mapping);
  checkMappingValues(mapping);
  checkMappingKeys(mapping);
};
