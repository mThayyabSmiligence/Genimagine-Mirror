const { deletePlanService, updatePlanService, createPlanService, getPlanByIdService, getAllPlansService } = require('../service/PlanService');


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
  try {
    await deletePlanService(req.params.id);
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    console.error("Error deleting plan:", err);
    res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
};
