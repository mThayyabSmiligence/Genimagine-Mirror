const { updatePlanService } = require("../service/PlanService");
const { getAllTopUpService, getTopUpByIdService, createTopUpService, updateTopUpService, deleteTopUpService } = require("../service/TopUpService");

exports.getAllTopUpController = async (req, res) => {
 
    const result = await getAllTopUpService();

    res.status(result.status).json(result);
  
};

exports.getTopUpByIdController = async (req, res) => {
    const {plan_id} = req.params

    const result = await getTopUpByIdService(plan_id);

    res.status(result.status).json(result);
}

exports.createTopUpController = async (req, res) => {
     const {
            credits,
            cost,
            currency,
            is_active,
        } = req.body;

        if (
    credits === undefined ||
    cost === undefined ||
    currency === undefined ||
    is_active === undefined
  ) {
    return res.status(400).json({
      status: 400,
      message: "Missing required fields: credits, cost, currency, is_active"
    });
  }
    
    const result = await createTopUpService(credits,cost,currency,is_active);
    res.status(result.status).json(result);
      
}

exports.updateTopUpController = async (req, res) => {
    const {plan_id} = req.params
    const {
            credits,
            cost,
            currency,
            is_active,
        } = req.body;
    const result = await updateTopUpService(plan_id, credits,cost,currency,is_active);
    res.status(result.status).json(result)
}

exports.deleteTopUpController = async (req, res) => {
    try {
        await deleteTopUpService(req.params.id);
        res.status(200).json({ success: true, message: 'Plan deleted successfully' });
      } catch (err) {
        console.error("Error deleting plan:", err);
        res.status(500).json({ success: false, message: 'Failed to delete plan' });
      }
}