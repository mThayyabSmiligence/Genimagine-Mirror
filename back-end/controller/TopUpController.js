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

  // console.log("del;ete4", req.params)/
    const {topup_package_id} = req.params
    // console.log("del;ete", plan_id)
    
    const result = await deleteTopUpService(topup_package_id);

    res.status(result.status).json(result);
      
}