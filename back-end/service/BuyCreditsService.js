const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const { customAlphabet } = require("nanoid");


exports.createPurchaseLog=async(user_id,package_id,custom_credits,currency,receipt_id, package_type)=>{
    if(!receipt_id){
        receipt_id=this.generateReceiptId(user_id)
    }
    try{
    
    let package_details=null;
    let amount=null;
    let credits=null

    //geting amount and credits from pakage if the package_id exists and if not the custom crdit is taken
        if(package_id){
            if (package_type === 'topup') {
            
            package_details = await this.getTopupPackageDetails(package_id);
        } else {
            
            package_details = await this.getPackageDetails(package_id);
        }

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
    const query= " insert into credit_purchase_logs (user_id,package_id,custom_credits,amount,currency,credits_received,receipt_id,package_type) values(?,?,?,?,?,?,?,?)"
    const [rows] = await db.execute(query,[user_id,package_id||0,custom_credits||0,amount,currency,credits,receipt_id, package_type||"new"])


    //returning successful message and data
    return {
        purchase_id:rows.insertId,
        user_id,
        package_id,
        custom_credits,
        amount,
        currency,
        receipt_id,
        package_type
    };
    }catch(err){
        console.log("error creating purchase log :",err)

        //sending false if the error occurs
        return false;
    }   
}

exports.setOrderId=async(purchase_id,order_id)=>{
    try{
        const query= "update credit_purchase_logs set order_id=? where purchase_id=?"
        const [rows] = await db.execute(query,[order_id,purchase_id])
        console.log("order id set successfully")
        return true;

    }catch(err){
        console.log("error setting order id :",err)
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
exports.updatePaymentStatus=async(payment_id,payment_method,status,order_id)=>{
    try{
        const query= "update credit_purchase_logs set payment_status=? , completed_at= now() , payment_id=? , payment_method = ? where order_id=?"
        const [rows] = await db.execute(query,[status, payment_id,payment_method,order_id])
        console.log("payment status updated successfully", status, payment_id,payment_method,order_id)
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


// example data:order_detail : {
//     entity: 'collection',
//     count: 1,
//     items: [
//       {
//         id: 'pay_Q1UTkKhu5bUa7i',
//         entity: 'payment',
//         amount: 5000,
//         currency: 'INR',
//         status: 'captured',
//         order_id: 'order_Q1UTcaqsZtNqeX',
//         invoice_id: null,
//         international: false,
//         method: 'upi',
//         amount_refunded: 0,
//         refund_status: null,
//         captured: true,
//         description: 'Test Transaction',
//         card_id: null,
//         bank: null,
//         wallet: null,
//         vpa: 'success@razorpay',
//         email: 'aaaa@aaaa.com',
//         contact: '+919999999999',
//         notes: [Object],
//         fee: 118,
//         tax: 18,
//         error_code: null,
//         error_description: null,
//         error_source: null,
//         error_step: null,
//         error_reason: null,
//         acquirer_data: [Object],
//         created_at: 1740824328,
//         upi: [Object]
//       }
//     ]
//   }
exports.savePaymentHistory = async(data)=>{
    try{
        const query = `
    INSERT INTO order_payments (
        payment_id, entity, amount, currency, status, order_id, invoice_id, international, method,
        amount_refunded, refund_status, captured, description, card_id, bank, wallet, vpa, email,
        contact, notes, fee, tax, error_code, error_description, error_source, error_step, error_reason,
        acquirer_data, upi
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;

    await db.query(query, data)
    return true;
    }catch(err){
        console.log("error saving payment history :",err)
        return false;
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

exports.getTopupPackageDetails=async(package_id)=>{
    try{
        const query = "SELECT * FROM topup_credit_packages WHERE topup_package_id =?"
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

exports.savePaymentLog=async(orderPaymentData)=>{
    const query = `
    INSERT INTO order_payments (
      payment_id, 
      entity, 
      amount, 
      currency, 
      status, 
      order_id, 
      invoice_id,
      international, 
      method, 
      amount_refunded, 
      refund_status, 
      captured, 
      description,
      card_id, 
      bank, 
      wallet, 
      vpa, 
      email, 
      contact, 
      notes, 
      fee, 
      tax, 
      error_code,
      error_description, 
      error_source, 
      error_step, 
      error_reason, 
      acquirer_data, 
      upi
    ) VALUES (
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?, 
      ?,
      ?
    )
  `;

  try {
    const [result] = await db.query(query, [
      orderPaymentData.id,
      orderPaymentData.entity,
      orderPaymentData.amount,
      orderPaymentData.currency,
      orderPaymentData.status,
      orderPaymentData.order_id,
      orderPaymentData.invoice_id || null,
      orderPaymentData.international || 0,
      orderPaymentData.method,
      orderPaymentData.amount_refunded || 0,
      orderPaymentData.refund_status || null,
      orderPaymentData.captured || 0,
      orderPaymentData.description || null,
      orderPaymentData.card_id || null,
      orderPaymentData.bank || null,
      orderPaymentData.wallet || null,
      orderPaymentData.vpa || null,
      orderPaymentData.email || null,
      orderPaymentData.contact || null,
      JSON.stringify(orderPaymentData.notes || {}),
      orderPaymentData.fee || 0,
      orderPaymentData.tax || 0,
      orderPaymentData.error_code || null,
      orderPaymentData.error_description || null,
      orderPaymentData.error_source || null,
      orderPaymentData.error_step || null,
      orderPaymentData.error_reason || null,
      JSON.stringify(orderPaymentData.acquirer_data || {}),
      JSON.stringify(orderPaymentData.upi || {}),
    ]);

    console.log('Inserted Order Payment ID:', result.insertId);
    return result.insertId;
  } catch (error) {
    console.error('Error inserting order payment:', error);
    throw error;
  }
}

exports.savePurchaseErrorLogs=async(errorData)=>{
    try{
        const insertQuery = `
        INSERT INTO credit_purchase_error_logs(
            error_code,
            error_description,
            error_source,
            error_step,
            error_reason,
            payment_id,
            order_id,
            metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Extract data from the error object
        const values = [
        errorData.code,
        errorData.description,
        errorData.source,
        errorData.step,
        errorData.reason,
        errorData.metadata.payment_id,
        errorData.metadata.order_id,
        JSON.stringify(errorData.metadata)
        ];

        await db.query(insertQuery, values)
        
    }
    catch(err){
        console.log("error saving purchase error logs :",err)
    }
}


exports.handleNewPackageFlow = async (purchaseLog, payment, razorpay_payment_id, razorpay_order_id, packageType) => {
    const user_id = purchaseLog.user_id;
    const package_id = purchaseLog.package_id;
    const creditsToAdd = purchaseLog.credits_received;

    const packageDetails = await this.getPackageDetails(package_id);

    console.log("package details", packageDetails)                                          // 4
    let validityDays = packageDetails?.validity_days || 30;

    //  const [activePlans] = await db.execute(
    //     `SELECT * FROM user_plan_credits WHERE user_id = ? AND is_active = 1`,
    //     [user_id]
    // );

    
     const [latestPlan] = await db.execute(
        `SELECT * FROM user_plan_credits WHERE user_id = ? ORDER BY expiry_date DESC LIMIT 1`,
        [user_id]
    );

    let startDate = `NOW()`;
    console.log("1 start date", startDate)                                                       // 5
    let expiryDate = `DATE_ADD(NOW(), INTERVAL ${validityDays} Minute)`;                        // changed date to minutues for testing
    console.log("1 expiry date", expiryDate)                                                     // 6
    let startParams = [];
    let expiryParams = [];

    let isActive = 1; 

    if (latestPlan.length > 0) {
        console.log("no current plan")
        const currentPlan = latestPlan?.[0];
        console.log("current plan", currentPlan)
        const [isExpired] = await db.execute(
            `SELECT NOW() > ? AS expired`, [currentPlan.expiry_date]
        );

        if (isExpired[0].expired) {
            await db.execute(
                `UPDATE user_plan_credits SET is_active = 0  WHERE id = ?`,
                [currentPlan.id]
            );
        } else {
            isActive = 0;
            startDate = `DATE_ADD(?, INTERVAL 0 SECOND)`; // force bind for safety
            expiryDate = `DATE_ADD(?, INTERVAL ${validityDays} Minute)`;                                       // changed date to minutues for testing
            startParams = [currentPlan.expiry_date];
            expiryParams = [currentPlan.expiry_date];
        }

        if (packageType === 'renew') {
            console.log("type is renew", packageType)
            await db.execute(
                `UPDATE user_plan_credits SET last_renewal_date = ? WHERE id = ?`,
                [currentPlan.expiry_date, currentPlan.id]
            );
        }

    }

    console.log("all insert for user_plan_credits", user_id, package_id, packageType, creditsToAdd, startDate, expiryDate, isActive, validityDays)

    await db.execute(
        `INSERT INTO user_plan_credits 
            (user_id, package_id, package_type, received_credits, credits_remaining, start_date, expiry_date, is_active, validity_days)
        VALUES (?, ?, ?, ?, ?, ${startDate}, ${expiryDate}, ?, ?)`,
        [
            user_id,
            package_id,
            packageType,
            creditsToAdd,
            creditsToAdd,
             ...startParams,
            ...expiryParams,
            isActive,
            validityDays
        ]
    );    
    const totalCredits = await this.getTotalActiveCredits(user_id);
    console.log("Total credits after processing", totalCredits)                                    // 7

    return {
        status: 200,
        success: true,
        message: "Plan processed successfully.",
        credits_received: totalCredits
    };
}

exports.handleTopupPayment = async (purchaseLog, payment, razorpay_payment_id, razorpay_order_id, packageType) => {
    try{
        const planId = purchaseLog.package_id;
        const userId = purchaseLog.user_id;
        const creditsToAdd = purchaseLog.credits_received;

        console.log("planId from purchase log", planId)                                             // 8
        console.log("userId from purchase log", userId)                                              // 9
        console.log("credits to add from purchase log", creditsToAdd)                               // 10

        const [activeBasePlan] = await db.execute(`SELECT package_id, expires_at FROM user_plan_credits WHERE user_id = ? AND is_active = 1 AND expires_at > NOW() LIMIT 1`, 
            [userId]
        )

        const basePlanExpiry = activeBasePlan.expires_at;
        const basePlanPackageId = activeBasePlan.package_id;

        console.log("base plan expiry", basePlanExpiry)                                        // 11 
        console.log("user plan package id", basePlanPackageId)                                 // 12

        await db.query(
            `INSERT INTO user_topups 
            (user_id, plan_id, base_plan_package_id, received_credits ,credits_remaining, is_active, start_date, end_date) 
            VALUES (?, ?, ?, ?, ?, 1, NOW(), ?)`,
            [userId, planId, basePlanPackageId, creditsToAdd, creditsToAdd, basePlanExpiry]
        );

       const totalCredits = await this.getTotalActiveCredits(userId);
          console.log("Total credits after processing", totalCredits)                              // 13

        return {
            status: 200,
            success: true,
            message: "Top-up successful and linked to active base plan.",
            credits_received: totalCredits
        };

    }catch(error){
        console.error("Error in handleTopupPayment:", error);
        return {
            status: 500,
            success: false,
            message: 'An error occurred while processing the top-up payment.'
        };
    }
}

exports.getTotalActiveCredits = async (userId) => {
    const [planCreditsResult] = await db.execute(
        `SELECT SUM(credits_remaining) AS total_plan_credits FROM user_plan_credits WHERE user_id = ? AND is_active = 1`,
        [userId]
    );
    console.log("plan credits result", planCreditsResult)                                          // 14

    const [topupCreditsResult] = await db.execute(
        `SELECT SUM(credits_remaining) AS total_topup_credits FROM user_topups WHERE user_id = ? AND is_active = 1`,
        [userId]
    );
    console.log("topup credits result", topupCreditsResult)  

    const planCredits = Number(planCreditsResult[0].total_plan_credits) || 0;
    console.log("get plancredits", planCredits)                                                   // 15
    const topupCredits = Number(topupCreditsResult[0].total_topup_credits) || 0;
    console.log("get top up credits", topupCredits)                                               // 16

    console.log("total credits", planCredits+topupCredits)                                      // 17

    return planCredits + topupCredits;
};
