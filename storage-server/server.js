const express = require('express');
const fileupload=require('express-fileupload')
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const { PORT,NODE_ENV } =  require('./config/config');

const { verifyToken } = require('./middleWare/authMiddleware');
const verifyTokenWithCookie = require('./middleWare/verifyTokenWithCookie');


const app = express();
app.use(fileupload())

require('dotenv').config();


app.listen(PORT, () => {
  console.log(`server listening to port ${PORT} in ${NODE_ENV}`)
})



app.post('/upload',verifyToken,(req,res)=>{

      if (!req.files || !req.files.image) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  

    const { userId, chatId, imageId, type } = req.body;
    const uploadedImage = req.files.image;

    let folderPath = `./uploads/users/${userId}/${chatId}`;
    if (type === 'chat') {
      folderPath = `./uploads/users/${userId}/${chatId}`;
    } else if (type === 'explore') {
      folderPath = `./uploads/explore/${userId}`;
    } else if (type === 'library') {
      folderPath = `./uploads/library/${userId}`;
    }

    fs.mkdirSync(folderPath, { recursive: true });

    const filePath = path.join(folderPath, `${imageId}.png`);

    uploadedImage.mv(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error saving file' });
      }
    })
      
      const imagePath= `uploads/users/${userId}/${chatId}/${imageId}`

      const imageUrl=`/chat/image/${userId}/${chatId}/${imageId}`
      console.log(4)

      res.status(200).json({message:"file is uploaded",imagePath:imagePath,imageUrl:imageUrl})
    
})

// api to retrive images from chats
app.get(`/chat/image/:userId/:chatId/:fileName`,verifyTokenWithCookie,(req,res)=>{
    const {userId,chatId,fileName}= req.params


    if(req.user.id!=userId){

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


//api to retrive images from explore
app.get(`/explore/image/:userId/:fileName`,verifyTokenWithCookie,(req,res)=>{
  const {userId,chatId,fileName}= req.params


  
  // If authorized, send the image file
  const imagePath = path.join(__dirname, 'uploads', 'explore', userId, fileName);

  // Check if the file exists
  if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
  } else {
      return res.status(404).json({ message: 'Image not found.' });
  }

})


//api to get library
app.get(`/library/image/:userId/:fileName`,verifyTokenWithCookie,(req,res)=>{
  const {userId,chatId,fileName}= req.params


  if(req.user.id!=userId){

      console.log(`user with id ${userId}  is not aurthorized to acces this image`)
       
      return res.status(403).json({
          message:"you are not aurthorised to acces this image"
      })
  }
  // If authorized, send the image file
  const imagePath = path.join(__dirname, 'uploads', 'library', userId, fileName);

  // Check if the file exists
  if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
  } else {
      return res.status(404).json({ message: 'Image not found.' });
  }

})


app.get("/testimage",(req,res)=>{
  console.log("testing")
  res.status(300).json({message:"just testing"})
})
