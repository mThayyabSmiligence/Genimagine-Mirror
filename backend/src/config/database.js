const {Sequelize} = require('sequelize');

require('dotenv').config();


const sequelize = new Sequelize(process.env.DATABASE, process.env.USER , process.env.PASSWORD, {
  host: process.env.HOST,   // or your DB host
  port: process.env.DB_PORT,
  dialect: "mysql",    // mysql | postgres | mssql | sqlite
  logging: false       // disable SQL query logging
});

module.exports = sequelize;