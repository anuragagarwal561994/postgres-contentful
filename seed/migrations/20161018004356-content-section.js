module.exports = {
  up(queryInterface, Sequelize) {
    /*
     Add altering commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return queryInterface.createTable('content_section', {
      title: Sequelize.STRING,
      displayTitle: Sequelize.BOOLEAN,
      contentText: Sequelize.STRING,
      externalId: {
        type: Sequelize.STRING,
        unique: true,
      },
      contentfulVersion: {
        type: Sequelize.INTEGER.UNSIGNED,
        validate: {
          min: 0,
        },
      },
    });
  },

  down(queryInterface) {
    /*
     Add reverting commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.dropTable('users');
     */

    return queryInterface.dropTable('content_section');
  },
};
