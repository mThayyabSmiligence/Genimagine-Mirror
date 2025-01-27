const db = require('../config/connectDatabase')
const bcrypt = require('bcrypt')

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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error :"+error.sqlMessage ,
        });
    }
};



// user login api - api/v1/user/login

exports.userLogin = async (req, res, next) => {
    try{
        const {email, password} = req.body
        const query = "Select * from users WHERE email = ?"
    
        const [oldUser] = await db.execute(query,[email]);

       
        const isPasswordMatch = await bcrypt.compare(password,oldUser[0].password_hash)
        if(oldUser.length==0){
            res.status(404).json({
                message:"user not found"
            })
            return
        }
          console.log(oldUser[0].password_hash)
        if(!isPasswordMatch){
            res.status(401).json({
                message:"unAuthorised"
            })
            return
        }
        res.status(200).json({
            success: true,
            message: "login successfully"
        });
    } catch(error){
        console.log(error)
    }
}