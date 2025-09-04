const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const Razorpay = require('razorpay');
const { generateReceiptId, createPurchaseLog, updatePaymentStatus, addPurchasedCradit, addPurchasedCredits, setOrderId, savePaymentHistory, savePaymentLog, savePurchaseErrorLogs, getPackageDetails, getPurchaseLogDetails, handleNewPackageFlow, handleTopupPayment, getTotalActiveCredits, getUserPlanStatusService } = require('../service/BuyCreditsService');
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

        if (package_type === 'topup') {
            const [activeBasePlan] = await db.execute(
                `SELECT id FROM user_plan_credits WHERE user_id = ? AND is_active = 1 AND expiry_date > NOW()`,
                [id]
            );
            console.log("active base plan ",activeBasePlan);
            
            if (!activeBasePlan.length) {
                return res.status(400).json({
                    success: false,
                    message: 'No active base plan found. Top-up not allowed.'
                });
            }
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
        const {razorpay_payment_id, razorpay_order_id, razorpay_signature,receipt_id } = req.body;
        const {id,username}=req.user;
        
        const payment = await instance.payments.fetch(razorpay_payment_id)
        const storePayment= await savePaymentLog(payment)

        const order_detail = await instance.orders.fetchPayments(razorpay_order_id)
        // console.log(razorpay_payment_id)
        // console.log(razorpay_order_id)

        if(payment.status!=='captured'){
            return res.status(400).json({ message: 'order is not paid!' });
        }

        const sha = crypto.createHmac('sha256',process.env.RAZOR_PAY_SECRET)
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const digest = sha.digest("hex");

        if(digest !== razorpay_signature){
            return res.status(400).json({ message: 'transaction is not legit!' });
        }

        const purchaseLog = await getPurchaseLogDetails(receipt_id);        
        if (!purchaseLog) {
            return res.status(404).json({ success: false, message: 'Purchase log not found' });
        }

        const packageType = purchaseLog.package_type || 'new';

    // Branch the logic                                 

        let response;

        if (packageType === 'topup') {
        response = await handleTopupPayment(purchaseLog, payment ,razorpay_payment_id ,razorpay_order_id, packageType);
        }else {
        response = await handleNewPackageFlow(purchaseLog, payment, razorpay_payment_id ,razorpay_order_id, packageType);
        } 

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



exports.expireOldPlans = async(req,res) => {
     try {
        await db.execute(`
            UPDATE user_plan_credits
            SET is_active = 0 ,credits_remaining = 0
            WHERE is_active = 1 AND expiry_date < NOW()
        `);

        await db.execute(`
            UPDATE user_topups 
            SET is_active = 0 ,credits_remaining = 0
            WHERE is_active = 1 AND expiry_date <= NOW()
        `);
      
        await db.execute(`
            UPDATE user_plan_credits
            SET is_active = 1
            WHERE is_active = 0 AND start_date <= NOW() AND expiry_date > NOW()
        `);

        console.log(`[Cron Job] Plan activation/deactivation done `);
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
