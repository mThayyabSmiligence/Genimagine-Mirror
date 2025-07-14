const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { getChatsByUserId, getImagesByChatId, addtoLibraryService, getLibraryImagesService, deleteFromLibraryService, deleteImageService, editUserService, getUserDataService, passwordChangeService, editChatNameService, deleteChatService, banUserService, unbanUserService, unsuspendUserService, suspendUserService, warnUser, deleteUserService, getUserNameService, getUserByIdService, getAllModelsService, getAllAspectRatiosService, getAllQualityLevelsService, getAllStylesService, getImageSettingsService, getResizedHeightWidth, getModelByIdService} = require('../service/UserService');
const { deleteChatFromServer } = require('../service/UploadToServerService');
const { generateImageWithStability } = require('../service/generateSDImage');
// get all users api - api/v1/users/list

exports.getUsersList = async (req, res, next) => {
    try{
        const [users] = await db.execute('SELECT * FROM users WHERE role = "user"');

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users
        })
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the users",
            error: error.message
        });
    }
}

exports.getCurrentUserDataController=async(req,res)=>{
    const {id} = req.user;
    
    const user = await getUserDataService(id);
    
    return res.status(user.status).json(user);
}

// get user by id api - api/v1/user/:id
 
exports.getSingleUser = async (req, res, next)=> {
    const userId = req.params.id;
    // console.log(userId);

    try{
        const [rows] = await db.execute(
            'SELECT * FROM guest_image_limits WHERE id = ?', 
            [userId]
        );
        // console.log(rows[0]);
        if(rows.length > 0){
            res.status(200).json({
                success: true,
                message: "User retrieved successfully",
                user: rows[0] 
            });
        } else {
            res.status(404).json({
                success: false,
                message: `No user found with ID ${userId}`
            });
        }
    } 
    catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the user",
            error: error.message
        });
    } 
} ;


exports.firstTimeVerification = async(req,res,next) => {
    res.status(200).json({
        message: "user with successfull token"
    })
}

exports.deleteImageController = async(req,res)=>{
    const {image_id}=req.params;
    const {id}=req.user;

            let cookies =null
            let token =null
            let decodeToken=null
            
            try{
                const cookies1 = cookie.parse(req.headers.cookie)
                cookies=cookies1    
                const token1 = cookies.token
                token= token1
                decodeToken= jwt.decode(token)
            }catch(err){
                console.log(err)
            }

    

    const response = await deleteImageService(id,image_id,token)

    console.log('token: ' + token)
    res.status(response.status).json({
        message:response.message,
        success:response.success,
        chat_deleted:response.chat_deleted
    })

}



exports.getChatsList=async(req,res,next)=>{
    //getting jwt token from cookies
    let cookies =null
    let token =null
    let decodeToken=null
            
    try{
        const cookies1 = cookie.parse(req.headers.cookie)
        cookies=cookies1    
        const token1 = cookies.token
        token= token1
        decodeToken= jwt.decode(token)
    }catch(err){
        console.log(err)
    }

    const {id,username,role}= decodeToken;

    const chatsList= await getChatsByUserId(id)

    if(!chatsList){
        res.status(404).json("error retriving chats List");
        return
    }

    res.status(200).json({
        messsage:"retrived chats list successfully",
        data:chatsList
    })
}

exports.getChatsData=async(req,res,next)=>{

    const {chatId}=req.params;
    const {page} = req.query;


    let cookies =null
    let token =null 
    let decodeToken=null
            
    try{
        const cookies1 = cookie.parse(req.headers.cookie) 
        cookies=cookies1    
        const token1 = cookies.token
        token= token1
        decodeToken= jwt.decode(token)
    }catch(err){
        console.log(err)
    }

    const {id,username,role}= decodeToken;
    //getting jwt token from cookies
  

    const chatData=await getImagesByChatId(chatId,id,page)


    res.status(chatData.status).json(chatData)

}

exports.editChatNameController=async(req, res, ) => {
    const {chatId, chatName}=req.body;
    const {id}=req.user;
    const response = await editChatNameService(id, chatId, chatName)
    res.status(response.status).json(response)
}

exports.addToLibraryController=async(req,res)=>{
    const {image_id}=req.params;
    const {id}=req.user;

    if(image_id==null){
        return res.status(400).json({
            message:"image_id is required"
        })
    }

    const result = await addtoLibraryService(id, image_id);
    
    return res.status(result.status).json({
        message:result.message,
        success:result.success
    })
}

exports.getLibraryImagesController=async(req,res)=>{
    const {id}=req.user;
    
    const libraryImages= await getLibraryImagesService(id);
    
    return res.status(libraryImages.status).json({
        message:libraryImages.message,
        success:libraryImages.success,
        data:libraryImages.data
    })
}

exports.deleteFromLibraryController =async(req,res)=>{
    const {image_id}=req.params;
    const {id}=req.user;

    const result = await deleteFromLibraryService(id,image_id);
    
    return res.status(result.status).json({
        message:result.message,
        success:result.success
    }) 
}

exports.editUserController=async(req,res)=>{
    const {id}=req.user;
    const {userName}=req.body;

    const result = await editUserService(id,userName);
    
    return res.status(result.status).json({
        message:result.message,
        success:result.success
    })
}
exports.passwordChangeController=async(req,res)=>{
    const {id}=req.user;
    const {currentPassword, newPassword}=req.body;
    
    const result = await passwordChangeService(id,currentPassword, newPassword);

    return res.status(result.status).json(result)
}

exports.deleteChatController=async(req,res)=>{

    const {chat_id}=req.params;
    const {id}=req.user;

    if(!chat_id){
        return res.status(400).json({
            message:"chatId is required"
        })
    }
    const result = await deleteChatService(id,chat_id);
    
    return res.status(result.status).json(result);
}

exports.getUserNameByIdController=async(req,res)=>{
    const {user_id}= req.params;
    const user= await getUserNameService(user_id);
    return res.status(user.status).json(user)
}

// ban-user
exports.banUserController = async(req,res)=>{
    const {user_id} = req.params;
    const changedBy = req.user?.id;
    const banUser = await banUserService(user_id, changedBy);
    return res.status(banUser.status).json(banUser)
}

exports.unbanUserController = async(req,res)=>{
    const {user_id} = req.params;
    const changedBy = req.user?.id;
    const unbanUser = await unbanUserService(user_id, changedBy);
    return res.status(unbanUser.status).json(unbanUser)
}

exports.suspendUserController = async(req,res)=> {
    const {user_id} = req.params;
    const {minutes, reason} = req.body;
    const changedBy = req.user?.id;

    const suspendUser = await suspendUserService(user_id, minutes, reason, changedBy );
    return res.status(suspendUser.status).json(suspendUser);
}

exports.unsuspendUserController = async (req, res) => {
    const { user_id } = req.params;
    const changedBy = req.user?.id;

    const unsuspendUser = await unsuspendUserService(user_id, changedBy);
    return res.status(unsuspendUser.status).json(unsuspendUser);
};

exports.warnUserController = async (req, res) => {
    const { user_id } = req.params;
    const { reason} = req.body;
    const warnedBy = req.user?.id;
    const warnedByRole = req.user?.role;

    if (warnedByRole !== "moderator") {
        return res.status(403).json({ success: false, message: "Only moderators can warn users" });
    }

    if (!user_id || !reason || !warnedBy) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const result = await warnUser(user_id, reason, warnedBy, warnedByRole);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error in warnUserController:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

exports.deleteUserController = async(req,res) => {
    const {user_id} = req.params;
    const changedBy = req.user?.id;

    const deleteUser = await deleteUserService(user_id, changedBy);
    return res.status(deleteUser.status).json(deleteUser);
}

exports.getUserByIdController = async(req,res) => {
    const {user_id} = req.params;

    const getUserById = await getUserByIdService(user_id);
    return res.status(getUserById.status).json(getUserById)
}

exports.getAllModelsController = async(req, res) => {
    const result = await getAllModelsService();
    return res.status(result.status).json(result);
};

exports.getModelByIdController = async(req, res) => {
    const {id} = req.params;

    const result = await getModelByIdService(id);
    return res.status(result.status).json(result);
};

exports.getAllAspectRatiosController = async(req, res) =>{
    const result = await getAllAspectRatiosService();
    return res.status(result.status).json(result);
}

exports.getAllQualityLevelsController = async(req, res) => {
    const result = await getAllQualityLevelsService();
    return res.status(result.status).json(result);
}

exports.getAllStylesController = async (req, res) => {
    const result = await getAllStylesService();
    return res.status(result.status).json(result);
};

exports.getStyleNameById = async (styleId) => {
  const [rows] = await db.execute("SELECT name FROM styles WHERE id = ?", [styleId]);
  return rows.length > 0 ? rows[0].name : null;
};

exports.getImageSettingsController = async (req, res) => {
    const result = await getImageSettingsService();
    return res.status(result.status).json(result)
}

exports.getResizedHeightWidthController = async(req, res) => {
    const getHeightWidth = await getResizedHeightWidth()
    return res.status(getHeightWidth.status).json(getHeightWidth)
}

 exports.generateImageWithStabilityController = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Prompt is required and must be a string.' });
    }

    const imageBuffer = await generateImageWithStability(prompt);

   res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
    });

    res.end(imageBuffer); 

  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      success: false,
      message: 'Image generation failed',
      error: error.message,
    });
  }
};