const db = require('../config/connectDatabase');
exports.GuestUserHandler = async (ipAddress) => {
    try {
        const dataExists = await checkDataExists(ipAddress);
        if (!dataExists) {
            const result = await createGuestUser(ipAddress);
            console.log(`New guest user created with IP Address: ${ipAddress}, Insert ID: ${result.insertId}`);
            return true;
        } else {
            let guestUserData = await GetGuestUser(ipAddress);
            let currentDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
            let generatedDate = guestUserData.generation_date.toISOString().split('T')[0]; // Already 'YYYY-MM-DD' from SQL query
            console.log("OLD data"+generatedDate+"currrent date"+currentDate)
            
            if (currentDate == generatedDate) {
                console.log("Checking if user has the limit");
                return guestUserData.image_count < 10?true:false;
            } else {
                console.log("Updating the guest data");
                const result = await UpdateGuestUser(guestUserData.id);
                console.log(result);
                return true;
            }
        }
    } catch (err) {
        console.error("Error handling guest user:", err.message);
        return false; 
    }
};

async function checkDataExists(ipAddress) {
    try {    
        console.log("inside check data exist")
        const [rows] = await db.execute(
            'SELECT COUNT(*) AS count FROM Guest_Image_Limits WHERE ip_address = ?',
            [ipAddress]
        );
        console.log(typeof(rows));
        if (rows[0].count > 0) {
            console.log(`Data exists for IP Address: ${ipAddress}`);
            return true;
        } else {
            console.log(`No data found for IP Address: ${ipAddress}`);
            return false;
        }
    } catch (error) {
        console.error('Error checking data:', error.message);
        return false;
    }
}

async function createGuestUser(ipAddress) {
    try {
        const currentDate = new Date()
        const [result] = await db.execute(
            'INSERT INTO Guest_Image_Limits (ip_address, i33mage_count) VALUES (?,?)',
            [ipAddress, 0]
        );
        return result; 
    } catch (error) {
        console.error('Error creating guest user:', error.message);
        throw error;
    }
}

async function GetGuestUser(ipAddress) {  
    try {
        const [rows] = await db.execute(
            'SELECT * FROM Guest_Image_Limits WHERE ip_address = ?',
            [ipAddress]
        );
        return rows[0]; // Returning the first row
    } catch (error) {
        console.error('Error fetching guest user:', error.message);
        throw error;
    } 
}

async function UpdateGuestUser(id){
    try {
        const query = `
                        UPDATE Guest_Image_Limits 
                        SET  image_count = 0   
                        WHERE id = ?;
                    `;
                    const result =await db.execute(query, [id]);
                    console.log("guest data is upadted")
                    return result;
    }
    catch(err){
        console.log("Error:"+ err.message)
    }
}