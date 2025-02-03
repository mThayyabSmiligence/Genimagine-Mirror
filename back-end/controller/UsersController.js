const db = require('../config/connectDatabase')
const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken} = require('../service/JWTtokenGeneration');
const cookie = require("cookie")
const jwt = require("jsonwebtoken")

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



// user register api - api/v1/users/register

exports.userRegister = async(req, res, next) => {
    const {username, password, age, email, confirmPassword, role='user'} = req.body
    try{

        if(password != confirmPassword){
            res.status(404).json({success: false, message: "Password do not match"})
            return; 
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const query = `INSERT INTO users (username, password_hash, age, email, role, credits) 
                    VALUES (?,?,?,?,?,?)`;
        const [rows] = await db.execute(query, [username, hashedPassword, age, email, role, 0]) 

        console.log(rows);
 
        res.status(200).json({
            success:  true,
            message: "user registered successfully",
            userId: rows.insertId
        });
    } catch (err) {
        console.error(err);

        if (err.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ message: 'Invalid foreign key reference' });
        }

        if (err.code === 'ER_DUP_ENTRY') {
           return res.status(409).json({ message: 'user with this email already exist' });
           
        }
        
        if (err.code === 'ER_DATA_TOO_LONG') {
            return res.status(400).json({ message: 'Input value too long' });
        }

        if (err.code === 'ER_BAD_NULL_ERROR') {
            return res.status(400).json({ message: 'Required field is missing' });
        }

        res.status(500).json({
            success: false,
            message: "Error :"+err.sqlMessage ,
        });
    }
};



// user login api - api/v1/user/login

exports.userLogin = async (req, res, next) => {
    try{
        const {email, password} = req.body
        const query = "Select * from users WHERE email = ?"
    
        const [oldUser] = await db.execute(query,[email]);
        

       
        
        if(oldUser.length==0){
            res.status(404).json({
                message:"user not found"
            })
            return
        }
          console.log(oldUser[0].password_hash)
          const isPasswordMatch = await bcrypt.compare(password,oldUser[0].password_hash)
        if(!isPasswordMatch){
            res.status(401).json({
                message:"unAuthorised"
            })
            return
        }

        console.log("test1 "+oldUser)

        const token =generateToken(oldUser[0]) ;
        const refreshToken= await generateRefreshToken(oldUser[0])
        

        let options = {
            maxAge: 1000 * 60 * 60, // expire after 60 minutes
            httpOnly: true, // Cookie will not be exposed to client side code
            sameSite: "none", // If client and server origins are different
            secure: true // use with HTTPS only
        }
        let refreshTokenOptions={
            maxAge: 1000 * 60 * 60 * 24 * 7, // expire after 1 week
            httpOnly: true, // Cookie will not be exposed to client side code
            sameSite: "none", // If client and server origins are different
            secure: true // use with HTTPS only
        }
        console.log("token   :"+token)
        console.log("refresh token 2  "+refreshToken)

        res.cookie( "token", token, options );
        res.cookie("refresh_token",refreshToken,refreshTokenOptions)
        
        res.status(200).json({
            success: true,
            message: "login successfully",
            
        });
    } catch(error){
        console.log(error)
    }
}

exports.userLogout= async (req,res,next)=>{
    let  cookies =null   

    try{
    
            const cookies1= cookie.parse(req.headers.cookie)
            cookies=cookies1;
        }
        catch(err){
            res.status(401).json({ message: 'User is already logged out' }) 
            return;
        }

    try{
        
        const refresh_token= cookies.refresh_token

        const decoded_refresh_token = jwt.decode(refresh_token)
        console.log(decoded_refresh_token)
        const query ="DELETE FROM refresh_token where user_id=?"

        const row =await db.execute(query,[decoded_refresh_token.id])
        

        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'Strict' });
        res.clearCookie('refresh_token',{ httpOnly: true, secure: true, sameSite: 'Strict' })
        res.status(200).json({
            message:"succesfully logged out"
        }) 
        return
    }
    catch(err){
        console.log("error loggingout : "+err)
        res.status(400).json({
            error:err
        })
    }   
}

exports.firstTimeVerification = async(req,res,next) => {
    res.status(200).json({
        message: "user with successfull token"
    })
}