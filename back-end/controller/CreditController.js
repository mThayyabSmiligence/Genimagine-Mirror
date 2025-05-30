const {  buyCreditsPackageService, getCreditPackagesService, getCreditTopUpService, getUserPurchasedTopUpService } = require("../service/CreditService")


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

// exports.buyCreditsPackageController=async(req,res)=>{

//     const {package_id}= req.params;
//     const {id}= req.user;

//     const response = await buyCreditsPackageService(package_id,id);
    
//     res.status(response.status).json(
//         {
//             message: response.message,
//             credits_purchased:response.credits_purchased

//         }
//     )

// }