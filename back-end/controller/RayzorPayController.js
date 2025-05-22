const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const Razorpay = require('razorpay');
const { generateReceiptId, createPurchaseLog, updatePaymentStatus, addPurchasedCradit, addPurchasedCredits, setOrderId, savePaymentHistory, savePaymentLog, savePurchaseErrorLogs, getPackageDetails, getPurchaseLogDetails } = require('../service/BuyCreditsService');
const crypto = require('crypto');
const { response } = require('express');


var instance = new Razorpay({ key_id: process.env.RAZOR_PAY_KEY, key_secret: process.env.RAZOR_PAY_SECRET })

exports.RayzorPayOrderController=async(req,res)=>{

    try{
        const {package_id,custom_credits,currency, package_type} = req.body; 
        const {id,username}=req.user;

        if(!package_id && (custom_credits<10||custom_credits>100000)){
            return res.status(400).json({ message: 'credits should be between 10 and 100000' });
        }
         
        //generating receipt id
        const receipt_id = generateReceiptId(id) 
        
        //checking if the razor pay keys exist and handling if they dont exist
        if (!process.env.RAZOR_PAY_KEY || !process.env.RAZOR_PAY_SECRET) {
            return res.status(500).json({ 
                message: "Razorpay keys are missing." ,
                success: false,
            });
        }
        
        //creating the puchase log in database
        const receipt =await createPurchaseLog(id,package_id,custom_credits,currency,receipt_id, package_type)
        
        //checking if the recipt is created successfully and handling if doesn't exist
        if(!receipt){
            return res.status(400).json({ message: 'Failed to create purchase log.' });
        }

        //creating instance of razor pay
        
        const amount = Number(receipt.amount);

        //checking if the amount is valid and handling if it's not
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid order amount." });
        }
        
        //creating order with razor pay instance
        const order = await instance.orders.create({
            amount: amount*100,
            currency: "INR",
            receipt: receipt_id||receipt.receipt_id,
        })
        
       

        //handling if the order is not created successfully
        if(!order){
            return res.status(400).json({ message: 'Failed to create order.' });
        }

        const result=await setOrderId(receipt.purchase_id,order.id)
        

        //joing the order and purchase log data.
        const data={...order,...receipt}

        console.log("order data",order)

        //sending succes response
        return res.status(200).json({
            success: true,
            data: data,
            message: 'Order created successfully.',
        });
    }
    catch(error){

        console.log(error)
        return res.status(500).json({ 
            message: 'Failed to create order.' ,
            success: false,
        });
    }

}
exports.validatePaymentController=async(req,res)=>{
    try{
        const {razorpay_payment_id, razorpay_order_id, razorpay_signature,receipt_id , action ="new"} = req.body;
        const {id,username}=req.user;
        
        const payment = await instance.payments.fetch(razorpay_payment_id)
        const storePayment= await savePaymentLog(payment)

        const order_detail = await instance.orders.fetchPayments(razorpay_order_id)
        console.log(razorpay_payment_id)
        console.log(razorpay_order_id)

        if(payment.status!=='captured'){
            return res.status(400).json({ message: 'order is not paid!' });
        }

        const sha = crypto.createHmac('sha256',process.env.RAZOR_PAY_SECRET)
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const digest = sha.digest("hex");

        if(digest !== razorpay_signature){
            return res.status(400).json({ message: 'transaction is not legit!' });
        }

//  today implemented
        const purchaseLog = await getPurchaseLogDetails(receipt_id);
        if (!purchaseLog) {
            return res.status(404).json({ success: false, message: 'Purchase log not found' });
        }

        let packageDetails = null;
        let validityDays = 30;

        if (purchaseLog.package_id) {
            packageDetails = await getPackageDetails(purchaseLog.package_id);
            if (packageDetails) {
                validityDays = packageDetails.validity_days;
            }
        }

        const now = new Date();
        console.log("Current Server Time:", now.toLocaleString());
        const formatDate = (date) => {
        return date.getFullYear() + "-" +
                String(date.getMonth() + 1).padStart(2, '0') + "-" +
                String(date.getDate()).padStart(2, '0') + " " +
                String(date.getHours()).padStart(2, '0') + ":" +
                String(date.getMinutes()).padStart(2, '0') + ":" +
                String(date.getSeconds()).padStart(2, '0');
        };

        const user_id = purchaseLog.user_id;
        const package_id = purchaseLog.package_id
        const creditsToAdd = purchaseLog.credits_received


        const [existingPlanRows] = await db.execute(
                "SELECT * FROM user_plan_credits WHERE user_id = ? AND package_id = ? AND is_active = 1",
                [user_id, package_id]
            );

            if (existingPlanRows.length > 0) {      
            const existingPlan = existingPlanRows[0];
            const expiryDate = new Date(existingPlan.expiry_date);

                if (expiryDate < now) {
                    // Expire the old plan
                    await db.execute(`
                        UPDATE user_plan_credits 
                        SET is_active = 0 
                        WHERE id = ?
                    `, [existingPlan.id]);

                    // Prevent further processing for renewal/top-up on this
                    existingPlanRows.length = 0;
                }
            }

            if (existingPlanRows.length > 0 && action !== 'new') {
                
                const existingPlan = existingPlanRows[0];
                
                if (action === 'renew' && packageDetails && packageDetails.allow_renewal) {
                    const expiryDate = new Date(existingPlan.expiry_date);
                    const newStartDate = now > expiryDate ? now : expiryDate;
                    const newExpiryDate = new Date(newStartDate);
                    newExpiryDate.setDate(newStartDate.getDate() + validityDays);

                    await db.execute(`
                        UPDATE user_plan_credits 
                        SET credits_remaining = ?, 
                            start_date = ?, 
                            expiry_date = ?, 
                            renewal_count = renewal_count + 1, 
                            last_renewal_date = ?, 
                            updated_at = CURRENT_TIMESTAMP,
                            is_active = 1,
                            validity_days = ?
                        WHERE id = ?
                    `, [
                        creditsToAdd,
                        formatDate(newStartDate),
                        formatDate(newExpiryDate),
                        formatDate(now),
                        existingPlan.id,
                        validityDays
                    ]);
                } else if (action === 'topup' && packageDetails && packageDetails.allow_top_up) {
                    await db.execute(`
                        UPDATE user_plan_credits 
                        SET credits_remaining = credits_remaining + ?, 
                            top_up_count = top_up_count + 1, 
                            updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    `, [
                        creditsToAdd,
                        existingPlan.id
                    ]);
                } else {
                    return {
                        status: 400,
                        message: "Action not allowed for this package"
                    };
                }

            } else {
                
                // First-time purchase                                                                      /////////////////
                const start_date = formatDate(now);
                // const expiry_date = formatDate(new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000));
                const expiry_date = formatDate(new Date(now.getTime() + validityDays * 60 * 1000));

                console.log("start data there", start_date)
                console.log("start data there", expiry_date)
                await db.execute(`
                    INSERT INTO user_plan_credits 
                    (user_id, package_id, credits_remaining, start_date, expiry_date, is_active, renewal_count, top_up_count, validity_days) 
                    VALUES (?, ?, ?, ?, ?, 1, 0, 0, ?)
                `, [user_id, package_id, creditsToAdd, start_date, expiry_date, validityDays]);
            }
        
        const response = await addPurchasedCredits(receipt_id)
        
        const updateResponse =await updatePaymentStatus(razorpay_payment_id,payment.method,payment.status,razorpay_order_id)
        
        
        if(updateResponse.success==false){
            return res.status(400).json({ message: 'credits added but failed to update payment status' })
        }
        
        return res.status(response.status).json(response)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ message: 'Failed to validate transaction.' })
    }

}


exports.expireOldPlans = async() => {
    // try {
    //     const [result] = await db.execute(`
    //         UPDATE user_plan_credits
    //         SET is_active = 0
    //         WHERE expiry_date < NOW() AND is_active = 1
    //     `);
    //     console.log(`[${new Date().toISOString()}] Expired plans updated:`, result.affectedRows);
    // } catch (err) {
    //     console.error("Error in expiring plans:", err);
    // }

    try {
        const now = new Date();

        const [expiredPlans] = await db.execute(`
        SELECT id FROM user_plan_credits 
        WHERE is_active = 1 AND expiry_date < ?
        `, [now]);

        if (expiredPlans.length > 0) {
        const idsToExpire = expiredPlans.map(p => p.id);
        console.log(`Expiring plans:`, idsToExpire);

        await db.execute(`
            UPDATE user_plan_credits 
            SET is_active = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id IN (${idsToExpire.map(() => '?').join(',')})
        `, idsToExpire);
        } else {
        console.log("No expired plans found.");
        }
    } catch (error) {
        console.error("Error in plan expiry cron job:", error);
    }
};



//example error object structure
//{
//     code: 'BAD_REQUEST_ERROR',
//     description: 'Payment was unsuccessful due to a temporary issue. If amount got deducted, it will be refunded within 5-7 working days.',
//     source: 'gateway',
//     step: 'payment_response',
//     reason: 'payment_failed',
//     metadata: {
//       payment_id: 'pay_Q8FG6mdNr6FYUL',
//       order_id: 'order_Q8FFoEsOzOwbOd'
//     }
//   }
exports.handelFailedPaymentController=async(req,res)=>{
    const {error}= req.body;

    console.log("error in payment",error)
    const payment = await instance.payments.fetch(error.metadata.payment_id)

    const updateStatus = await updatePaymentStatus(error.metadata.payment_id,payment.method,payment.status,error.metadata.order_id)
    const storePayment= await savePaymentLog(payment)
    const storeError = await savePurchaseErrorLogs(error)



    res.status(400).json({message: 'Failed to complete transaction'})
}
