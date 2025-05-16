// const { getAllPlansService, getPlanByIdService, subscribeToPlanService } = require("../service/PlanService")

// exports.getAllPlansController = async(req, res) => {
//     const result = await getAllPlansService()

//     res.status(result.status).json(result);
// }

// exports.getPlanByIdController = async(req, res) => {
//     const {id} = req.params

//     const result = await getPlanByIdService(id)
//     res.status(result.status).json(result);
// }

// exports.subscribeToPlanController = async (req, res) => {

//     const {planId}= req.params;
//     const {id}= req.user;
//     const result = await subscribeToPlanService(planId, id);
    
//     res.status(result.status).json(result);
// };

// exports.renewPlanController = async (req, res) => {
//   try {
//     const { userPlanId } = req.body;
//     await renewSubscription(userPlanId);
//     res.json({ message: 'Plan renewed successfully.' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.topUp = async (req, res) => {
//   try {
//     const { userId, userPlanId, topUpOptionId } = req.body;
//     await planService.topUpCredits(userPlanId, topUpOptionId, userId);
//     res.json({ message: 'Top-up successful.' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
