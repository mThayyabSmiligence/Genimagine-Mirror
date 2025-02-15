const db = require('../config/connectDatabase');

exports.getCreditPackageService=async()=>{

    try {
        const [packages] = await db.execute('SELECT * FROM credit_purchase_packages');
        return packages;
    } catch (error) {
        console.log("eorror retriving packages",error);
        return false;
    }
 
}

