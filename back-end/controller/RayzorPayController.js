const db = require('../config/connectDatabase')
const cookie = require("cookie")
const jwt = require("jsonwebtoken");
const Razorpay = require('razorpay');
const { generateReceiptId, createPurchaseLog, updatePaymentStatus, addPurchasedCradit, addPurchasedCredits, setOrderId, savePaymentHistory } = require('../service/BuyCreditsService');
const crypto = require('crypto');
const { response } = require('express');

exports.RayzorPayOrderController=async(req,res)=>{

    try{
        const {package_id,custom_credits,currency } = req.body;
        const {id,username}=req.user;

        //generating receipt id
        const receipt_id =generateReceiptId(id) 
        
        //checking if the razor pay keys exist and handling if they dont exist
        if (!process.env.RAZOR_PAY_KEY || !process.env.RAZOR_PAY_SECRET) {
            return res.status(500).json({ 
                message: "Razorpay keys are missing." ,
                success: false,
            });
        }

        //creating the puchase log in database
        const receipt =await createPurchaseLog(id,package_id,custom_credits,currency,receipt_id)
        
        //checking if the recipt is created successfully and handling if doesn't exist
        if(!receipt){
            return res.status(400).json({ message: 'Failed to create purchase log.' });
        }

        //creating instance of razor pay
        var instance = new Razorpay({ key_id: process.env.RAZOR_PAY_KEY, key_secret: process.env.RAZOR_PAY_SECRET })

        
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
        const {razorpay_payment_id, razorpay_order_id, razorpay_signature,receipt_id} = req.body;
        const {id,username}=req.user;

        var instance = new Razorpay({ key_id: process.env.RAZOR_PAY_KEY, key_secret: process.env.RAZOR_PAY_SECRET })
        
        const payment = await instance.payments.fetch(razorpay_payment_id)

        const order_detail = await instance.orders.fetchPayments(razorpay_order_id)
        console.log(razorpay_payment_id)
        console.log(razorpay_order_id)

        const sha = crypto.createHmac('sha256',process.env.RAZOR_PAY_SECRET)
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const digest = sha.digest("hex");
        
        if(digest !== razorpay_signature){
            return res.status(400).json({ message: 'transaction is not legit!' });
        }

        const response = await addPurchasedCredits(receipt_id)

        const updateResponse =await updatePaymentStatus(receipt_id,razorpay_payment_id,payment.method)

        if(updateResponse.success==false){
            return res.status(400).json({ message: 'credits added but failed to update payment status' })
        }

        console.log(" payment detail :",payment)
        console.log("order_detail :",order_detail)
        console.log('upi data',order_detail.items[0].upi )
        const result = await savePaymentHistory(order_detail.items)

        return res.status(response.status).json(response)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({ message: 'Failed to validate transaction.' })
    }

}

exports.handelFailedPaymentController=async(req,res)=>{
    const {error}= req.body;

    console.log(error)

    res.status(500).json({message: 'Failed to complete transaction'})
}