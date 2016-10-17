const chalk = require('chalk');
const isFunction = require('lodash/isFunction');

module.exports = {
  /**
   * Colors the value and adds a default keyword to be displayed in help of a command
   *
   * @param {string} value - represents a default value
   * @returns {string}
   */
  defaultString(value) {
    return chalk.cyan(`[default: ${value}]`);
  },

  /**
   * Exit module for the commands to end gracefully
   *
   * @param {Object} program
   * @param {Function} [onSuccess] - to be called when program exits successfully
   * @returns {function(*=)}
   */
  exitModule(program, onSuccess) {
    const logger = program.log;

    return (err) => {
      // return exit code 0 if no error
      if (!err) {
        if (isFunction(onSuccess)) {
          onSuccess();
        }
        process.exit(0);
      }

      // if error display the error message with code (if present)
      let errMessage = err.message;
      if (err.code) {
        errMessage = `${err.code}: ${errMessage}`;
      }

      logger.error(errMessage);

      // and exit with exit code 1
      process.exit(1);
    };
  },
};
