const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path')
dotenv.config({path: path.join(__dirname,"config.env")})

const connection = mysql.createPool({ 
    host: process.env.HOST,
    port: process.env.DB_PORT,
    user: process.env.USER,
    password: process.env.PASSWORD, 
    database: process.env.DATABASE 
})

connection.getConnection().then(() => console.log('Connected to the MySQL Database'))
.catch(err => {
    console.error('Error connecting to the database:', err.message);
    process.exit(1); // Exit the app if the DB connection fails
});
// .connect((err) => {
//     if(err) {
//         console.log('Error connecting to the database',err.message)
//         return;
//     } else {
//         console.log('connected to the MySql Database')
//     }
// });

module.exports = connection;