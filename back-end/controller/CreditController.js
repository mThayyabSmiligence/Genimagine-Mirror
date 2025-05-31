const {  buyCreditsPackageService, getCreditPackagesService, getCreditTopUpService, getUserPurchasedTopUpService, getTotalActiveCredits } = require("../service/CreditService")


exports.getCreditPackagesController=async(req,res)=>{

    const credit_purchase_packages = await getCreditPackagesService();
    if(!credit_purchase_packages){
        return res.status(400).json({
            success: false,
            message: 'Failed to get credit purchase packages',
     });
    }
    
    return res.status(200).json({
        success: true,
        data: credit_purchase_packages,
    });
 
}

exports.getCreditTopUpController = async(req, res)=>{
    const result = await getCreditTopUpService();
    
    res.status(result.status).json(result);
}

exports.getUserPurchasedTopUp =async(req, res)=>{
    const userId = req.user.id; 

    const result = await getUserPurchasedTopUpService(userId);

    res.status(result.status).json(result);
}

exports.getTotalActiveCreditsController = async(req, res)=>{
    const userId = req.user.id;

    const result = await getTotalActiveCredits(userId);

    res.status(200).json({credits : result});
}