const fs = require('fs');

module.exports = (filename) => {
  let fileExists = true;

  try {
    fs.accessSync(filename, fs.F_OK);
  } catch (err) {
    fileExists = false;
  }

  return {
    name: 'overwrite',
    type: 'confirm',
    message: `Overwrite ${filename}:`,
    default: false,
    when: fileExists,
  };
};
