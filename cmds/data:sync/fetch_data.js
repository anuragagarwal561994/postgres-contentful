const co = require('co');
const pgp = require('pg-promise')();

module.exports = co.wrap(function *exec(connection, tableName, columns, where = '1=1') {
    const db = pgp(connection);
    let cols = columns;

    if (!cols.includes('externalid')) {
        cols.push('externalid');
    }

    yield db.connect();
    const result = yield db.query(`SELECT ${cols.join(', ')} FROM ${tableName} WHERE ${where}`);
    pgp.end();

    return result;
});
