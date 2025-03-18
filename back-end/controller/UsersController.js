const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { getChatsByUserId, getImagesByChatId, addtoLibraryService, getLibraryImagesService, deleteFromLibraryService, deleteImageService, editUserService, getUserDataService, passwordChangeService, editChatNameService, deleteChatService} = require('../service/UserService');
const { deleteChatFromServer } = require('../service/UploadToServerService');
// get all users api - api/v1/users/list

exports.getUsersList = async (req, res, next) => {
    try{
        const [users] = await db.execute('SELECT * FROM users');

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

    console.log("chat_id",chatId);
    console.log("page",page);

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
