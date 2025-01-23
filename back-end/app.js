const express = require('express');

const app = express();
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname, 'config', 'config.env')})

console.log("hello world");

app.listen(process.env.PORT,() => {
    console.log(`server listening to port ${process.env.PORT} in ${process.env.NODE_ENV}`)
});