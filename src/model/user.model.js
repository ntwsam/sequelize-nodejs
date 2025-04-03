const { INTEGER, STRING, ENUM } = require('sequelize')
const sequelize = require('../config/sequelize')

const userModel = sequelize.define('Users', {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: STRING,
        unique: true,
        allowNull: false,
    },
    email: {
        type: STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: STRING,
        unique: true,
        allowNull: false,
    },
    role: {
        type: ENUM('admin', 'user'),
        allowNull: false,
    }
})

module.exports = userModel