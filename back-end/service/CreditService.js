const db = require('../config/connectDatabase');

const crypto = require('crypto') 

exports.getCreditPackagesService=async()=>{

    try {
        const [packages] = await db.execute('SELECT * FROM credit_purchase_packages  WHERE package_id <> 0');
        return packages;
    } catch (error) {
        console.log("error retriving packages",error);
        return false;
    }
 
}

exports.getCreditPackagedataService=async(package_id)=>{
    try {
        const query = "SELECT * FROM credit_purchase_packages WHERE package_id=?"
        const [rows] = await db.execute(query,[package_id])
        console.log("credit package data ",rows)
        return rows[0]
    } catch (error) {
        console.error("error fetching credit package data",error)
        return false;
    }
}

exports.buyCreditsPackageService=async(package_id,user_id)=>{
    const credit_package_data = await this.getCreditPackagedataService(package_id)

    if(!credit_package_data){
        return {
            status:404,
            message:"package not found"
        }
    }
    if(!credit_package_data){
        return {
            status:500,
            mesage:"error loading package data"
        }
    }

    const randomString=crypto.randomBytes(5)
        .toString('hex') // Convert to hex or use 'base64'
        .slice(0, 5);
    const purchas_id= await this.createPurchasePackageLog(user_id,package_id,credit_package_data.credits,"rupees","pending",randomString)

    if(!purchas_id){
        return {
            status:500,
            message:"error creating purchase log"
        }
    }
    try{
        
        const buyQuery= "update users set credits=credits+? where user_id=?"

        const [buy_responce]=await db.execute(buyQuery,[credit_package_data.credits,user_id]);
        console.log("credit added successfully")
        const updateLogStatus =await this.updatePurchaseLogStatus(purchas_id,"complted")
        return{
            status:200,
            message:"credits purchased successfully",
            credits_purchased:credit_package_data.credits
        }
    }catch(err){
        console.log("error buying crdits :",err)
        const updateLogStatus = await this.updatePurchaseLogStatus(purchas_id,"failed")
        return {
            status:500,
            message:"error while buying credits"
        }
    }

}

exports.createPurchasePackageLog=async(user_id,package_id,credits_received,currency,payment_status,transaction_id )=>{
    try{

        const query = "insert into credit_purchase_logs (user_id,package_id,credits_received,currency,payment_status,transaction_id ) values(?,?,?,?,?,?)";

        const [rows] = await db.execute(query,[user_id,package_id,credits_received,currency,payment_status,transaction_id ])


        return rows.insertId;
    }catch(err){
        console.log("error creating purchase log :",err)
        return false;
    }
}
 
exports.updatePurchaseLogStatus=async(purchase_id,status )=>{
    try{
        const query= "update credit_purchase_logs set payment_status=? where purchase_id=?"
        const [rows] = await db.execute(query,[status,purchase_id])

    }catch(err){
        console.log("error updating purchase log status :",err)
        return false;
    }
}