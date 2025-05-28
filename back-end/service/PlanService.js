const db = require('../config/connectDatabase');

exports.getAllPlansService = async () => {
    try{
        const [rows] = await db.execute('SELECT * FROM credit_purchase_packages WHERE is_latest = 1 ORDER BY created_at ASC');
        return {
            status: 200,
            message: "plans fetched successfully",
            data : rows
        }
    }catch(error){
        console.error("error fetching plans", error);
        return{
            status: 500,
            message: "error fetching plans"
        }
    }
};

exports.getPlanByIdService = async (id) => {
    try{
        const [rows] = await db.execute('SELECT * FROM credit_purchase_packages WHERE package_id = ?', [id]);
        if(rows.length == 0){
            return{
                status: 404,
                message: "plan not found"
            }
        } 
        return {
            status: 200,
            message: "plan fetched successfully",
            rows : rows[0]
        }
    }catch(error){
        console.error("Error fetching plan by ID", error);
        return{
            status: 500,
            message: "error fetching plan by ID"
        }
    }
  
};

exports.createPlanService = async (package_name,credits,description,cost,currency,allow_renewal,is_active,validity_days) => {
    try{
        const [maxResult] = await db.execute(`SELECT MAX(package_id) AS max_id FROM credit_purchase_packages`);
        const maxId = maxResult[0].max_id || 0;
        const Package_id = maxId + 1;

        const [allPlans] = await db.execute("SELECT * from credit_purchase_packages");
        const nameExists = allPlans.some(plan => plan.package_name === package_name);
        if (nameExists) {
            return {
                status: 400,
                message: 'The package name should not be the same as an existing one'
            };
        }

        console.log("all plan", allPlans)

        const [result] = await db.execute(`
        INSERT INTO credit_purchase_packages 
        (package_id, package_name, credits, description, cost, currency, allow_renewal, is_active, parent_package_id, validity_days, is_latest)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [Package_id ,package_name, credits, description, cost, currency, allow_renewal, is_active, Package_id, validity_days, 1]
    );

    return {
        status: 200, 
        message: "plan created successfully",
        data: result
    }
    }catch(error){
        console.error("Error creating plans", error);
        return{
            status: 500,
            message: "error creating plans"
        }
    }
};

exports.updatePlanService = async (id, package_name, credits, description, cost, currency, allow_renewal, is_active, validity_days) => {

    try{
        const [existingRows] = await db.execute(
          'SELECT * FROM credit_purchase_packages WHERE package_id = ?',
          [id]
        );
     
        if (existingRows.length === 0) {
          return res.status(404).json({ message: 'Package not found' });
        }

        const [allPlans] = await db.execute("SELECT * from credit_purchase_packages");
        const nameExists = allPlans.some(plan => plan.package_name == package_name);
        if (nameExists) {
            return {
                status: 400,
                message: 'The package name should not be the same as an existing one'
            };
        }

        const existingPackage = existingRows[0];
        const parentPackageId = existingPackage.parent_package_id;
     
        // Step 2: Get new package_id
        const [maxIdResult] = await db.execute(
          'SELECT MAX(package_id) as maxId FROM credit_purchase_packages'
        );
        const newPackageId = maxIdResult[0].maxId + 1;
    
        await db.execute(
          'UPDATE credit_purchase_packages SET is_active = 0, is_latest = 0 WHERE parent_package_id= ?',
          [parentPackageId]
        );

        await db.execute(
          `INSERT INTO credit_purchase_packages
            (package_id, package_name, credits, description, cost, currency, allow_renewal, is_active, parent_package_id, validity_days, is_latest)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newPackageId,
            package_name,
            credits,
            description,
            cost,
            currency ,
            allow_renewal ,
            is_active,
            parentPackageId,
            validity_days,
            1
          ]
        );

            return {
            status: 200, 
            message: "plan updated successfully",
        }
    } catch(error){
        console.error("Error creating plans", error);
        return{
            status: 500,
            message: "error updating plans"
        }
    }
};

exports.deletePlanService = async (id) => {
     try{
        const [rows] = await db.execute('DELETE FROM credit_purchase_packages WHERE package_id = ?', [id]);
        if(rows.length == 0){
            return{
                status: 404,
                message: "plan not found"
            }
        } 
    }catch(error){
        console.error("Error deleting plan by ID", error);
        return{
            status: 500,
            message: "error deleting plan by ID"
        }
    }
};
