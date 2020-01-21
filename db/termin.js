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
        datum: {
            type: DataTypes.STRING,
            validate: {
                is: /^((3[01]|[12][0-9]|0[1-9])\.(1[012]|0[1-9])\.\d{4})|(\bnull\b)$/
            }
        },
        datum: Sequelize.STRING,
        semestar: Sequelize.STRING,
        pocetak: Sequelize.TIME,
        kraj: Sequelize.TIME
    })
    return Termin;
}