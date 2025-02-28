const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const Razorpay = require('razorpay');
const { generateReceiptId, createPurchaseLog, updatePaymentStatus, addPurchasedCradit, addPurchasedCredits } = require('../service/BuyCreditsService');
const crypto = require('crypto');

exports.RayzorPayOrderController=async(req,res)=>{

    try{
        const {package_id,custom_credits,currency } = req.body;
  
        const {id,username}=req.user;

        const receipt_id =generateReceiptId(id)


        
        const receipt =await createPurchaseLog(id,package_id,custom_credits,currency,receipt_id)
        
        if(!receipt){
            return res.status(400).json({ message: 'Failed to create purchase log.' });
        }
        var instance = new Razorpay({ key_id: process.env.RAZOR_PAY_KEY, key_secret: process.env.RAZOR_PAY_SECRET })

        
        const order = await instance.orders.create({
            amount: Number(receipt.amount)*100,
            currency: "INR",
            receipt: receipt_id||receipt.receipt_id,
        })

        if(!order){
            return res.status(400).json({ message: 'Failed to create order.' });
        }
        const data={...order,...receipt}
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
        const {razorpay_payment_id, razorpay_order_id, razorpay_signature,receipt_id} = req.body;
        const {id,username}=req.user;

        var instance = new Razorpay({ key_id: process.env.RAZOR_PAY_KEY, key_secret: process.env.RAZOR_PAY_SECRET })

        
        const payment = await instance.payments.fetch(razorpay_payment_id)

        console.log(razorpay_payment_id)
        console.log(razorpay_order_id)

        const sha = crypto.createHmac('sha256',process.env.RAZOR_PAY_SECRET)
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const digest = sha.digest("hex");
        
        console.log(digest)
        console.log(razorpay_signature)
        if(digest !== razorpay_signature){
            return res.status(400).json({ message: 'transaction is not legit!' });
        }

        const response = await addPurchasedCredits(receipt_id)

        const updateResponse =await updatePaymentStatus(receipt_id,razorpay_payment_id,payment.method)

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