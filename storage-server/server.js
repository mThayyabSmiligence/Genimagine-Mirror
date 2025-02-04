const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { PORT,NODE_ENV } =  require('./config/config');

const app = express();

require('dotenv').config();


app.listen(PORT, () => {
  console.log(`server listening to port ${PORT} in ${NODE_ENV}`)
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { userId, chatId ,isChat,isExplore,isLibrary} = req.body;

      let folderPath=null;
      if(isChat){
        folderPath= `./uploads/users/${userId}/${chatId}`
      }else if( isExplore){
        folderPath =`./uploads/explore/${userId}`
      }else if(isLibrary){
        folderPath=`./uploads/library/${userId}`
      }

      // Ensure the directory exists 
      fs.mkdirSync(folderPath, { recursive: true });
  
      cb(null, folderPath); // Destination folder
    },
    filename: (req, file, cb) => {
      cb(null, req.body.image_id); 
    },
}); 

app.post('/')