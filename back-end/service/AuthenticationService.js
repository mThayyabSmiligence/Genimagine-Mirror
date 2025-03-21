const db = require('../config/connectDatabase');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const { register } = require('module');




exports.generateUserVerificationToken=async(user_id,email)=>{
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    try{
        const query = "insert into user_verification_tokens (user_id,email,verification_token,expires_at)  values(?,?,?,DATE_ADD(NOW(), INTERVAL 60 MINUTE))"
        const [rows] = await db.execute(query,[user_id,email,verificationTokenHash])

        console.log("Verification token is generated")
        console.log(rows)
        return verificationToken;
    }catch(err){
        return false;
    }   
}

exports.verifyUserWithVerificationToken = async(verification_token)=>{

    const verificationTokenHash = crypto.createHash('sha256').update(verification_token).digest('hex');

    let user_id=null;
    try{
        console.log(verification_token)
        const query = "SELECT * FROM user_verification_tokens WHERE verification_token=? AND expires_at > NOW()"
        const [rows] = await db.execute(query,[verificationTokenHash])
        console.log(1)
        if(rows.length==0){
            return {
                status: 404
            }
        }
        console.log(3)
        user_id=rows[0].user_id;
    }
    catch(err){
        
        console.error("error in verifiing user", err)
        return{
            status: 500
        }
    }

    try{
        console.log(user_id)
        const query = "UPDATE users SET is_verified=1 WHERE user_id=?"
        const [rows] = await db.execute(query,[user_id])
        console.log(4)
        console.log(rows)
        if(rows.affectedRows==0){
            return {
                status: 404
            }
        }
        console.log(5)
        return {
            status: 200
        }

    }catch(err){
        console.error("error in verifying user", err)
        return{
            status: 500
        }
    }
}

exports.generateTestEmailService=async(email,password)=>{
    try{
        const query = `INSERT INTO users (username, password_hash, age, email, role, credits,dob,is_verified) 
                    VALUES (?,?,?,?,?,?,?,?)`;

        
        const hashedPassword = await bcrypt.hash(password, 10)

        const [rows] = await db.execute(query, ['test', hashedPassword, 30, email, 'user', 0, '2000-01-01', 1])
        return [{
            username:'test',
            user_id: rows.insertId,
            age:30,
            role:'user',
            email:email,
            credits:0,
            dob:'2000-01-01',
            is_verified:1,
            register_type:'password',
            password_hash:hashedPassword
        }]
    }catch(err){ 
        console.error("error in generating test email", err)
        return null;
    }
}