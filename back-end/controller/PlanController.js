const { deletePlanService, updatePlanService, createPlanService, getPlanByIdService, getAllPlansService, getUserPlanStatusService } = require('../service/PlanService');


exports.getAllPlansController = async (req, res) => {
 
    const result = await getAllPlansService();

    res.status(result.status).json(result);
  
};

exports.getPlanByIdController = async (req, res) => {
    const {package_id} = req.params;

    const result = await getPlanByIdService(package_id);
    res.status(result.status).json(result);
};

exports.createPlanController = async (req, res) => {

    const {
        package_name,
        credits,
        description,
        cost,
        currency,
        allow_renewal,
        is_active,
        validity_days
    } = req.body;

    const result = await createPlanService(package_name,credits,description,cost,currency,allow_renewal,is_active,validity_days);
    res.status(result.status).json(result);
  
};

exports.updatePlanController = async (req, res) => {
  
    const {package_id} = req.params;
    const {
        package_name,
        credits,
        description,
        cost,
        currency,
        allow_renewal,
        is_active,
        validity_days
    } = req.body;

    const result = await updatePlanService(package_id, package_name, credits, description, cost, currency, allow_renewal, is_active, validity_days);
    res.status(result.status).json(result)

};

exports.deletePlanController = async (req, res) => {
    
    const {package_id} = req.params

   const result = await deletePlanService(package_id);

    res.status(result.status).json(result);
  
};

exports.getUserPlanStatusContoller = async(req, res) => {
    const userId = req.user.id;
    const result = await getUserPlanStatusService(userId);

    res.status(result.status).json(result);
}