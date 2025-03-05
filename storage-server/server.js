const express = require('express');
const fileupload=require('express-fileupload')
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const { PORT,NODE_ENV,ALLOWERD_ORGIN_1,ALLOWERD_ORGIN_2,STORAGE_SERVER_BASE_URL} =  require('./config/config');

const { verifyToken } = require('./middleWare/authMiddleware');
const verifyTokenWithCookie = require('./middleWare/verifyTokenWithCookie');
require('dotenv').config();




const app = express();
app.use(fileupload())


app.use(cors({
  origin: [ALLOWERD_ORGIN_1, ALLOWERD_ORGIN_2],
  credentials: true, // Allow cookies and authentication headers
}));




app.use(express.json());

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
      
      const imagePath= `uploads/users/${userId}/${chatId}/${imageId}.png`

      const imageUrl=`${STORAGE_SERVER_BASE_URL}/chat/image/${userId}/${chatId}/${imageId}.png`


      res.status(200).json({message:"file is uploaded",imagePath:imagePath,imageUrl:imageUrl})
    
})



app.post('/publish-to-explore', verifyToken, async (req, res) => {
  try {
      const { userId, imagePath} = req.body;

      console.log(1)
      if (!userId || !imagePath) {
          return res.status(400).json({ message: "User ID and image path are required" });
      }
      console.log(2)
      // Get the image file name from the path
      const imageFileName = path.basename(imagePath);
      const explorePath = `./uploads/explore/${userId}`;

      console.log(3)
      // Ensure explore folder exists
      fs.mkdirSync(explorePath, { recursive: true });

      console.log(4)
      // Copy image from chat/library to explore
      const newImagePath = path.join(explorePath, imageFileName);
      fs.copyFileSync(imagePath, newImagePath);

      console.log(5)
      // Generate public image URL
      const imageUrl = `${STORAGE_SERVER_BASE_URL}/explore/image/${userId}/${imageFileName}`;

     

      console.log(6)
      res.status(200).json({
          status:200,  
          success: true,
          message: "Image successfully added to Explore",
          imagePath: newImagePath,
          imageUrl: imageUrl
      });

  } catch (error) {
      console.error("Error adding image to Explore:", error);
      res.status(500).json({ 
        success: false,
        status: 500,
        message: "Internal server error in storage server" });
  }
});

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
app.get(`/explore/image/:userId/:fileName`,(req,res)=>{
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


app.delete('/image/delete', verifyToken, (req, res) => {
  const { filePath } = req.body; // Expecting filePath like "uploads/users/36/tS7H-L1I8ThB60ZnZOjzu/363"

  if (!filePath) {
      return res.status(400).json({ message: 'File path is required.' });
  }

  // Ensure the file path is inside the allowed directory
  const absolutePath = path.join(__dirname, filePath);   

  // Security check to prevent deleting files outside the intended directory
  if (!absolutePath.startsWith(path.join(__dirname, 'uploads', 'users'))) {
      return res.status(403).json({ message: 'Unauthorized file deletion attempt.' });
  }

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found.' });
  }

  // Delete the file
  fs.unlink(absolutePath, (err) => {
      if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ message: 'Error deleting file.' });
      }
      res.status(200).json({ message: 'File deleted successfully.' });
  });
});
