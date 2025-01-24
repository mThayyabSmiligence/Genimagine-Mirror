const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path')
dotenv.config({path: path.join(__dirname,"config.env")})

const connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.DB_PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE 
})

connection.connect((err) => {
    if(err) {
        console.log('Error connecting to the database',err.message)
        return;
    } else {
        console.log('connected to the MySql Database')
    }
});

module.exports = connection;