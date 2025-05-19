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

    // exports.buyCreditsPackageService=async(package_id,user_id ,action = 'new')=>{
    //     const credit_package_data = await this.getCreditPackagedataService(package_id)

    //     if(!credit_package_data){
    //         return {
    //             status:404,
    //             message:"package not found"
    //         }
    //     }
    //     if(!credit_package_data){
    //         return {
    //             status:500,
    //             mesage:"error loading package data"
    //         }
    //     }
    
    //     const creditsToAdd = credit_package_data.credits;
    //     const validityDays = credit_package_data.validity_days || 30;
    //     const now = new Date();
    //     const formatDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

    //     const randomString=crypto.randomBytes(5)
    //         .toString('hex') // Convert to hex or use 'base64'                                                              /////////
    //         .slice(0, 5);
    //     const purchas_id= await this.createPurchasePackageLog(user_id,package_id,creditsToAdd,credit_package_data.currency,"pending",randomString)

    //     if(!purchas_id){
    //         return {
    //             status:500,
    //             message:"error creating purchase log"
    //         }
    //     }

    //     try {
    //         const [existingPlanRows] = await db.execute(
    //             "SELECT * FROM user_plan_credits WHERE user_id = ? AND package_id = ? AND is_active = 1",
    //             [user_id, package_id]
    //         );

    //         console.log("print existing plan", existingPlanRows)
    //         if (existingPlanRows.length > 0 && action !== 'new') {
    //             const existingPlan = existingPlanRows[0];

    //             if (action === 'renew' && credit_package_data.allow_renewal) {
    //                 const expiryDate = new Date(existingPlan.expiry_date);
    //                 const newStartDate = now > expiryDate ? now : expiryDate;
    //                 const newExpiryDate = new Date(newStartDate);
    //                 newExpiryDate.setDate(newStartDate.getDate() + validityDays);

    //                 await db.execute(`
    //                     UPDATE user_plan_credits 
    //                     SET credits_remaining = ?, 
    //                         start_date = ?, 
    //                         expiry_date = ?, 
    //                         renewal_count = renewal_count + 1, 
    //                         last_renewal_date = ?, 
    //                         updated_at = CURRENT_TIMESTAMP,
    //                         is_active = 1
    //                     WHERE id = ?
    //                 `, [
    //                     creditsToAdd,
    //                     formatDate(newStartDate),
    //                     formatDate(newExpiryDate),
    //                     formatDate(now),
    //                     existingPlan.id
    //                 ]);
    //             } else if (action === 'topup' && credit_package_data.allow_top_up) {
    //                 await db.execute(`
    //                     UPDATE user_plan_credits 
    //                     SET credits_remaining = credits_remaining + ?, 
    //                         top_up_count = top_up_count + 1, 
    //                         updated_at = CURRENT_TIMESTAMP 
    //                     WHERE id = ?
    //                 `, [
    //                     creditsToAdd,
    //                     existingPlan.id
    //                 ]);
    //             } else {
    //                 return {
    //                     status: 400,
    //                     message: "Action not allowed for this package"
    //                 };
    //             }

    //         } else {
    //             // First-time purchase                                                                      /////////////////
    //             const start_date = formatDate(now);
    //             // const expiry_date = formatDate(new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000));
    //             const expiry_date = formatDate(new Date(now.getTime() + validityDays * 60 * 1000));

    //             await db.execute(`
    //                 INSERT INTO user_plan_credits 
    //                 (user_id, package_id, credits_remaining, start_date, expiry_date, is_active, renewal_count, top_up_count) 
    //                 VALUES (?, ?, ?, ?, ?, 1, 0, 0)
    //             `, [user_id, package_id, creditsToAdd, start_date, expiry_date]);
    //         }

    //         // Add credits to user                                                                       /////////////////
    //         await db.execute(
    //             "UPDATE users SET credits = credits + ? WHERE user_id = ?",
    //             [creditsToAdd, user_id]
    //         );

    //         await this.updatePurchaseLogStatus(purchas_id, "completed");

    //         return {
    //             status: 200,
    //             message: "Credits purchased successfully",
    //             credits_purchased: creditsToAdd
    //         };

    //     } catch (err) {
    //         console.error("Error buying credits:", err);
    //         await this.updatePurchaseLogStatus(purchas_id, "failed");
    //         return {
    //             status: 500,
    //             message: "Error while buying credits"
    //         };
    //     }

    // try{
        
    //     const buyQuery= "update users set credits=credits+? where user_id=?"

    //     const [buy_responce]=await db.execute(buyQuery,[credit_package_data.credits,user_id]);
    //     console.log("credit added successfully")
    //     const updateLogStatus =await this.updatePurchaseLogStatus(purchas_id,"complted")
    //     return{
    //         status:200,
    //         message:"credits purchased successfully",
    //         credits_purchased:credit_package_data.credits
    //     }
    // }catch(err){
    //     console.log("error buying crdits :",err)
    //     const updateLogStatus = await this.updatePurchaseLogStatus(purchas_id,"failed")
    //     return {
    //         status:500,
    //         message:"error while buying credits"
    //     }
    // }

// }


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