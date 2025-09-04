const db = require('../config/connectDatabase');

exports.getAllPlansService = async () => {
    try{
        const [rows] = await db.execute('SELECT * FROM credit_purchase_packages ORDER BY parent_package_id ASC, created_at ASC');
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
          return {
            status: 404,
            message: 'Package not found'
            };

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

// exports.deletePlanService = async (id) => {
//      try{
//         const [rows] = await db.execute('DELETE FROM credit_purchase_packages WHERE package_id = ?', [id]);
//         if(rows.length == 0){
//             return{
//                 status: 404,
//                 message: "plan not found"
//             }
//         } 
//     }catch(error){
//         console.error("Error deleting plan by ID", error);
//         return{
//             status: 500,
//             message: "error deleting plan by ID"
//         }
//     }
// };

// exports.deletePlanService = async (id) => {
//   try {

//     const [existingPlans] = await db.execute("")

//     const [result] = await db.execute(
//       'UPDATE credit_purchase_packages SET is_deleted = 1 WHERE package_id = ?',
//       [id]
//     );

//     if (result.affectedRows === 0) {
//       return {
//         status: 404,
//         message: "Plan not found"
//       };
//     }

// //    const [remainingPlans] = await db.execute(
// //       'SELECT * FROM credit_purchase_packages WHERE is_deleted = 0 ORDER BY created_at DESC'
// //     );

//     return {
//       status: 200,
//       message: "Plan soft-deleted"
//     };
//   } catch (error) {
//     console.error("Error soft deleting plan", error);
//     return {
//       status: 500,
//       message: "Error soft deleting plan"
//     };
//   }
// };

exports.deletePlanService = async (id) => {
  try {
    const [existingRows] = await db.execute(
      'SELECT * FROM credit_purchase_packages WHERE package_id = ? AND is_deleted = 0',
      [id]
    );

    if (existingRows.length === 0) {
      return {
        success: false,
        status: 404,
        message: "Plan not found or already deleted"
      };
    }

    const plan = existingRows[0];

    await db.execute(
      `UPDATE credit_purchase_packages 
       SET is_deleted = 1, is_active = 0, is_latest = 0 
       WHERE package_id = ?`,
      [id]
    );

    return {
      success: true,
      status: 200,
      message: "Plan soft-deleted successfully"
    };
  } catch (error) {
    console.error("Error soft deleting plan", error);
    return {
      status: 500,
      message: "Internal server error while deleting plan"
    };
  }
};


exports.getAllRemainingPlans = async () => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM credit_purchase_packages WHERE is_deleted = 0 ORDER BY created_at DESC'
    );
    return rows;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

exports.getUserPlanStatusService = async(userId) =>{
    try{     
        const [activePlans] = await db.execute(
            `SELECT * FROM user_plan_credits 
             WHERE user_id = ? AND is_active = 1 
             ORDER BY expiry_date DESC LIMIT 1`,
            [userId]
        );
    
        let currentPlan = activePlans[0] || null;
        let scheduledPlan = null;
        let isExpiringSoon = false;
        let daysLeft = null;
    
        if (currentPlan) {
            const [futurePlans] = await db.execute(
                `SELECT * FROM user_plan_credits 
                 WHERE user_id = ? AND is_active = 0 AND start_date > NOW() 
                 ORDER BY start_date ASC LIMIT 1`,
                [userId]
            );
            scheduledPlan = futurePlans[0] || null;
    
            const [daysResult] = await db.execute(
                `SELECT DATEDIFF(expiry_date, NOW()) AS days_left 
                 FROM user_plan_credits WHERE id = ?`,
                [currentPlan.id]
            );
            daysLeft = daysResult[0]?.days_left ?? null;
    
            if (daysLeft !== null && daysLeft <= 2 && daysLeft >= 0) {
                isExpiringSoon = true;
            }
    
            // Auto-activate scheduled plan if expired
            const [expiredCheck] = await db.execute(
                `SELECT NOW() > expiry_date AS expired 
                 FROM user_plan_credits WHERE id = ?`,
                [currentPlan.id]
            );
    
            if (expiredCheck[0].expired && scheduledPlan) {
                await db.execute(
                    `UPDATE user_plan_credits SET is_active = 0 WHERE id = ?`,
                    [currentPlan.id]
                );
    
                await db.execute(
                    `UPDATE user_plan_credits SET is_active = 1 WHERE id = ?`,
                    [scheduledPlan.id]
                );
    
                currentPlan = scheduledPlan;
                scheduledPlan = null;
                isExpiringSoon = false;
            }
        }
    
        return {
            status: 200,
            success: true,
            current_plan: currentPlan,
            scheduled_plan: scheduledPlan,
            is_expiring_soon: isExpiringSoon,
            days_left: daysLeft,
        };
    }catch(error){
        console.error("error checking plan status: ", error)
        return {
            status: 500,
            message: "error checking plan status"
        }
    }
};