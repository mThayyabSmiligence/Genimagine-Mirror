const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { getChatsByUserId, getImagesByChatId, addtoLibraryService, getLibraryImagesService, deleteFromLibraryService, deleteImageService } = require('../service/UserService');
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


// get user by id api - api/v1/user/:id
 
exports.getSingleUser = async (req, res, next)=> {
    const userId = req.params.id;
    // console.log(userId);

    try{
        const [rows] = await db.execute(
            'SELECT * FROM Guest_Image_Limits WHERE id = ?', 
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
        success:response.success
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

    console.log("chat_id",chatId);

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
  

    const chatData=await getImagesByChatId(chatId,id)


    res.status(chatData.status).json({
        message:chatData.message
    })

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

    const result = await deleteFromLibraryService(image_id);
    
    return res.status(result.status).json({
        message:result.message,
        success:result.success
    }) 
}