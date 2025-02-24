const {  buyCreditsPackageService, getCreditPackagesService } = require("../service/CreditService")


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

exports.buyCreditsPackageController=async(req,res)=>{
    //logic to buy credits
    const {package_id}= req.params;
    const {id}= req.user;

    const response = await buyCreditsPackageService(package_id,id);
    
    res.status(response.status).json(
        {
            message: response.message,
            credits_purchased:response.credits_purchased

        }
    )

}