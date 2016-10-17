module.exports = accessToken => ({
  name: 'accessToken',
  type: 'input',
  message: 'Enter your Contentful access_token:',
  default: accessToken,
  validate(value) {
    if (value.length) {
      return true;
    }
    return 'Please enter your Contentful access_token';
  },
  when: !process.env.CONTENTFUL_ACCESS_TOKEN,
});
