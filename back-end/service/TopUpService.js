const db = require('../config/connectDatabase');

exports.getAllTopUpService = async () => {
    try{
        const [rows] = await db.execute('SELECT * FROM topup_credit_packages ORDER BY created_at ASC');
        return {
            status: 200,
            message: "top up plans fetched successfully",
            data : rows
        }
    }catch(error){
        console.error("error fetching top up", error);
        return{
            status: 500,
            message: "error fetching top up"
        }
    }
};

exports.getTopUpByIdService = async (planId) => {
     try{
        const [rows] = await db.execute('SELECT * FROM topup_credit_packages WHERE topup_package_id = ?', [planId]);
        if(rows.length == 0){
            return{
                status: 404,
                message: "top-up not found"
            }
        } 
        return {
            status: 200,
            message: "top-up fetched successfully",
            rows : rows[0]
        }
    }catch(error){
        console.error("Error fetching top-up by ID", error);
        return{
            status: 500,
            message: "error fetching top-up by ID"
        }
    }
}

exports.createTopUpService = async (credits,cost,currency,is_active) => {
    try{
        const [result] = await db.execute(`Insert INTO topup_credit_packages(credits, cost, currency, is_active) 
            VALUES( ?, ?, ?, ?)`,[credits, cost, currency, is_active]
        );

        return{
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
}

exports.updateTopUpService = async (planId, credits,cost,currency,is_active) => {
    try{
        const [existingRows] = await db.execute(
              'SELECT * FROM topup_credit_packages WHERE topup_package_id = ?',
              [planId]
            );
         
            if (existingRows.length === 0) {
              return res.status(404).json({ message: 'Package not found' });
            }

            await db.execute(
            `UPDATE topup_credit_packages 
            SET credits = ?, cost = ?, currency = ?, is_active = ?
            WHERE topup_package_id = ?`,
            [credits, cost, currency, is_active, planId]
        );

        return{
            status : 200,
            message: 'Top-up package updated successfully',
            data: {
                    topup_package_id: planId,
                    credits,
                    cost,
                    currency,
                    is_active,
                  },
        }
    }catch(error){
        console.error("Error updating plans", error);
        return{
            status: 500,
            message: "error updating plans"
        }
    }
}

exports.deleteTopUpService = async (id) => {
    console.log("del;ete", id)
     try{
        const [rows] = await db.execute('DELETE FROM topup_credit_packages WHERE topup_package_id = ?', [id]);
        if(rows.length == 0){
            return{
                status: 404,
                message: "top up not found"
            }
        } 

        return{
            status: 200,
            message: "top up deleted successfully"
        }
    }catch(error){
        console.error("Error deleting top up by ID", error);
        return{
            status: 500,
            message: "error deleting top up by ID"
        }
    }
};