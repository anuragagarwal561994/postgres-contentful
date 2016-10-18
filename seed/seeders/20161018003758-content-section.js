module.exports = {
  up(queryInterface) {
    /*
     Add altering commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.bulkInsert('Person', [{
     name: 'John Doe',
     isBetaMember: false
     }], {});
     */

    return queryInterface.bulkInsert('content_section', [
      {
        title: 'Homepage',
        displayTitle: true,
        contentText: 'This is our <b>home</b> page!',
        externalId: 'qwert',
      },
      {
        title: 'About Us',
        displayTitle: true,
        contentText: 'This is our <b>about us</b> page!',
        externalId: 'asdfg',
      },
      {
        title: 'Contact Us',
        displayTitle: true,
        contentText: 'This is our <b>contact us</b> page!',
        externalId: 'zxcvb',
      },
    ]);
  },

  down(queryInterface) {
    /*
     Add reverting commands here.
     Return a promise to correctly handle asynchronicity.

     Example:
     return queryInterface.bulkDelete('Person', null, {});
     */

    return queryInterface.bulkDelete('content_section', null, {});
  },
};
