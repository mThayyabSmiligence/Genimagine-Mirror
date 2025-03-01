const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { customAlphabet } = require("nanoid");


exports.createPurchaseLog=async(user_id,package_id,custom_credits,currency,receipt_id)=>{
    if(!receipt_id){
        receipt_id=this.generateReceiptId(user_id)
    }
    try{
    
    let package_details=null;
    let amount=null;
    let credits=null

    //geting amount and credits from pakage if the package_id exists and if not the custom crdit is taken
    if(package_id){
        package_details= await this.getPackageDetails(package_id)
        if (!package_details) {
            return res.status(400).json({ 
                message: 'Invalid package ID.',
                success: false 
            });
        }
        //let non_dec_amount=package_details.cost;
        // amount = non_dec_amount.toFixed(2);
        amount= package_details.cost;
        credits=package_details.credits
    }else{
        amount=Number(custom_credits).toFixed(2);
        credits=custom_credits
    }


    //creating query and inserting data into table
    const query= " insert into credit_purchase_logs (user_id,package_id,custom_credits,amount,currency,credits_received,receipt_id) values(?,?,?,?,?,?,?)"
    const [rows] = await db.execute(query,[user_id,package_id||9,custom_credits||0,amount,currency,credits,receipt_id ])

    //returning successful message and data
    return {
        purchase_id:rows.insertId,
        user_id,
        package_id,
        custom_credits,
        amount,
        currency,
        receipt_id
    };
    }catch(err){
        console.log("error creating purchase log :",err)

        //sending false if the error occurs
        return false;
    }   
}

exports.addPurchasedCredits=async(receipt_id)=>{

    try{
        const log_data= await this.getPurchaseLogDetails(receipt_id)
        if(!log_data){
            console.log("purchase log not found")
            return {
                status:404,
                message:"purchase log not found",
                success:false
            }
        }
        const user_id=log_data.user_id
        const credits_received =log_data.credits_received;

        const query = "update users set credits= credits + ? where user_id= ? "
        const [rows] = await db.execute(query,[credits_received,user_id])
        console.log("credit added successfully")
        if(rows.affectedRows==0){
            console.log("user not found")
            return {
                status:404,
                message:"user not found",
                success:false
            }
        }

        return {
            status:200,
            message:"credit added successfully",
            success:true,
            credits_received
        }

    }
    catch(err){
        console.log("error adding credit :",err)
        return {
            status:500,
            message:"error adding credit",
            success:false
        }

    }
}
exports.updatePaymentStatus=async(receipt_id,transaction_id,payment_method)=>{
    try{
        const query= "update credit_purchase_logs set payment_status='captured' , completed_at= now() , transaction_id=? , payment_method = ? where receipt_id=?"
        const [rows] = await db.execute(query,[ transaction_id,payment_method,receipt_id,])
        console.log("payment status updated successfully")
        return {
            status:200,
            message:"payment status updated successfully",
            success:true
        }
    }catch(err){
        console.log("error updating payment status :",err)
        return {
            status:500,
            message:"valid transaction but the status of the transaction is not updated",
            success:false
        }
    }
}

//function to generate recipt id in REC-'date'-User'user_id'-'random 6 char string
exports.generateReceiptId = (userId) => {

    
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`; 
    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6); // 6-char random string
    return `REC-${date}-USER${userId}-${nanoid()}`;
}

exports.getPackageDetails=async(package_id)=>{
    try{
        const query = "SELECT * FROM credit_purchase_packages WHERE package_id =?"
        const [result] = await db.query(query,[package_id])
        return result[0]
    }catch(err){
        console.log(err)
        return null
    }
}

exports.getPurchaseLogDetails=async(receipt_id)=>{
    try{
        const query = "SELECT * FROM credit_purchase_logs WHERE receipt_id =?"
        const [result] = await db.query(query,[receipt_id])
        return result[0]
    }catch(err){
        console.log(err)
        return null
    }
}