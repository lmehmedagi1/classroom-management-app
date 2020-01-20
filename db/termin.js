const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
    const Termin = sequelize.define('Termin', {
        redovni: Sequelize.BOOLEAN,
        dan: {
            type: Sequelize.INTEGER,
            validate: {
                is: /^[0-6]$/i
            }
        },
        datum: Sequelize.STRING,
        semestar: Sequelize.STRING,
        pocetak: Sequelize.TIME,
        kraj: Sequelize.TIME
    })
    return Termin;
}