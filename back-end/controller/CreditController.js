const { getCreditPackageService } = require("../service/CreditService")


exports.getCreditPackagesController=async(req,res)=>{

    const credit_purchase_packages = await getCreditPackageService();
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