const { Sequelize } = require('sequelize')
const mysql = require('mysql2/promise')

require('dotenv').config()

const db_host = process.env.MYSQL_HOST
const db_name = process.env.MYSQL_DATABASE
const db_port = process.env.MYSQL_PORT
const db_password = process.env.MYSQL_PASSWORD
const db_user = process.env.MYSQL_USER


// ⭐️ create pool if not have database for create database
const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    password: db_password,
    port: db_port
});

const sequelize = new Sequelize(
    db_name,
    db_user,
    db_password,
    {
        host: db_host,
        dialect: 'mysql',
        port: db_port,
        logging: false,
    }
);

(async () => {
    try {
        await pool.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\``) // ⭐️ create database if not exists
        await pool.query(`USE ${db_name}`)

        await sequelize.authenticate() // ⭐️ creck connection
        await sequelize.sync({ after: true }) // ⭐️ sync table
        console.log('Connect to MySQL')
    } catch (err) {
        console.error('Error to connect database:', err)
    } finally {
        await pool.end()
    }
})();

module.exports = sequelize