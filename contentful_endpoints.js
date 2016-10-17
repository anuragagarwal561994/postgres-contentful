const BASE_URL = 'https://api.contentful.com';
const SPACE_ENDPOINT = `${BASE_URL}/spaces`;
const CONTENT_TYPES_ENDPOINT = spaceId => `${SPACE_ENDPOINT}/${spaceId}/content_types`;
const ENTRIES_ENDPOINT = spaceId => `${SPACE_ENDPOINT}/${spaceId}/entries`;

module.exports = {
  BASE_URL,
  SPACE_ENDPOINT,
  CONTENT_TYPES_ENDPOINT,
  ENTRIES_ENDPOINT,
};
