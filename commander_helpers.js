const chalk = require('chalk');
const isFunction = require('lodash/isFunction');

module.exports = {
  defaultString(value) {
    return chalk.cyan(`[default: ${value}]`);
  },
  exitModule(program, onSuccess) {
    const logger = program.log;

    return (err) => {
      if (!err) {
        if (isFunction(onSuccess)) {
          onSuccess();
        }
        process.exit(0);
      }

      let errMessage = err.message;
      if (err.code) {
        errMessage = `${err.code}: ${errMessage}`;
      }

      logger.error(errMessage);
      process.exit(1);
    };
  },
};
