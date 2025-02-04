const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const { PORT,NODE_ENV } =  require('./config/config');

const { verifyToken } = require('./middleWare/authMiddleware');


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

const upload=multer({storage:storage})

app.post('/upload',verifyToken,upload.single('image'),(req,res)=>{

    const {userId,chatId,imageId}=req.body;

    if(!req.file){
        return res.status(400).json({
            message:"no file is uploaded"
        })
    }

    const imagePath= `uploads/users/${userId}/${chatId}/${imageId}`

    const imageUrl=`/chat/image/${userId}/${chatId}/${imageId}`

    res.status(200).json({message:"file is uploaded",imagePath:imagePath,imageUrl:imageUrl})
})


app.get(`/chat/image/:userId/:chatId/:fileName`,verifyToken,(req,res)=>{
    const {userId,chatId,fileName}= req.params


    if(req.user.idd!=userId){

        console.log(`user with id ${userId}  is not aurthorized to acces this image`)
         
        return res.status(403).json({
            message:"you are not aurthorised to acces this image"
        })
    }
    // If authorized, send the image file
    const imagePath = path.join(__dirname, 'uploads', 'users', userId, chatId, fileName);

    // Check if the file exists
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        return res.status(404).json({ message: 'Image not found.' });
    }

})

