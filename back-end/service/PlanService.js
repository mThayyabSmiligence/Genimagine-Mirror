// const db = require('../config/connectDatabase');

// exports.getAllPlansService = async() => {
//     try{
//         const query = "SELECT * FROM plans WHERE is_active = 1 ORDER BY id ASC";
//         const [rows] = await db.execute(query)
        
//         console.log("retrieved plans successfully", rows )
//         return{
//             status : 200,
//             success: true,
//             message: "retrieved plans successfully",
//             rows
//         }
        
//     }catch(error){
//         console.error("error getting list of plans",error.message)
//         return{
//             status: 500,
//             message: "error getting list of plans"
//         }
//     }
// }
// exports.getPlanByIdService = async(planId) => {
//    try{
//         const query = "SELECT * FROM pLans WHERE id = ?"
//         const [rows] = await db.execute(query, [planId])
        
//         console.log("retrieved plan by id successfully", rows )
//         return{
//             status : 200,
//             success: true,
//             message: "retrieved plan by id successfully",
//             rows: rows[0]                 
//         }
        
//     }catch(error){
//         console.error("error getting plan by id",error.message)
//         return{
//             status: 500,
//             message: "error getting plan by id"
//         }
//     }
// }

// exports.subscribeToPlanService = async (userId, planId) => {
//   const [[plan]] = await db.query(`SELECT * FROM plans WHERE id = ? AND is_active = 1`, [planId]);
//   if (!plan) throw new Error('Plan not found');

//   const expiryDate = new Date();
//   expiryDate.setDate(expiryDate.getDate() + plan.validity_days);

//   await db.query(`
//     INSERT INTO user_plan_credits (user_id, plan_id, credits_remaining, start_date, expiry_date)
//     VALUES (?, ?, ?, NOW(), ?)
//   `, [userId, planId, plan.credit_amount, expiryDate]);
// };

// exports.renewSubscription = async (userPlanId) => {
//   const [[data]] = await db.query(`
//     SELECT upc.*, p.credit_amount, p.validity_days 
//     FROM user_plan_credits upc
//     JOIN plans p ON upc.plan_id = p.id
//     WHERE upc.id = ? AND upc.is_active = 1
//   `, [userPlanId]);

//   if (!data) throw new Error('Active subscription not found');

//   const newExpiry = new Date(data.expiry_date);
//   newExpiry.setDate(newExpiry.getDate() + data.validity_days);

//   await db.query(`
//     UPDATE user_plan_credits
//     SET credits_remaining = credits_remaining + ?,
//         expiry_date = ?,
//         renewal_count = renewal_count + 1,
//         last_renewal_date = NOW()
//     WHERE id = ?
//   `, [data.credit_amount, newExpiry, userPlanId]);
// };

// exports.topUpCredits = async (userPlanId, topUpOptionId, userId) => {
//   const [[topUp]] = await db.query(`SELECT * FROM top_up_options WHERE id = ? AND is_active = 1`, [topUpOptionId]);
//   if (!topUp) throw new Error('Top-up option not found');

//   await db.query(`
//     UPDATE user_plan_credits
//     SET credits_remaining = credits_remaining + ?,
//         top_up_count = top_up_count + 1
//     WHERE id = ?
//   `, [topUp.credit_amount, userPlanId]);

//   await db.query(`
//     INSERT INTO user_top_up_log (user_id, user_plan_credit_id, top_up_option_id, credit_added, price_paid)
//     VALUES (?, ?, ?, ?, ?)
//   `, [userId, userPlanId, topUpOptionId, topUp.credit_amount, topUp.price]);
// };
