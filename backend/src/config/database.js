const dotenv = require('dotenv');
const path = require('path')
dotenv.config({path: path.join(__dirname,"config.env")})
const {Sequelize} = require('sequelize');



const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USER , process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,   // or your DB host
  port: process.env.DB_PORT,
  dialect: "mysql",    // mysql | postgres | mssql | sqlite
  logging: false       // disable SQL query logging
});

module.exports = sequelize;