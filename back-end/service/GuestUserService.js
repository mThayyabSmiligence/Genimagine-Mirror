const db = require('../config/connectDatabase');

exports.GuestUserHandler = async (ipAddress) => {
    const dataExists = await checkDataExists(ipAddress); 
    // console.log(dataExists); 
    if(!dataExists){
        const result = await createGuestUser(ipAddress);
        console.log(`New guest user created with IP Address: ${ipAddress}, Insert ID: ${result.insertId}`);
        return true;
    }else{
       const guestUserData= await GetGuestUser(ipAddress)
       
    }
}

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
        const currentDate = new Date().toISOString().split('T')[0]
        const [result] = await db.execute(
            'INSERT INTO Guest_Image_Limits (ip_address, generation_date, image_count) VALUES (?,?,?)',
            [ipAddress, currentDate, 0]
        );
        return result; 
    } catch (error) {
        console.error('Error creating guest user:', error.message);
        throw error;
    }
}

async function GetGuestUser(ipAddress){  
        try {
            const [rows] = await db.execute(
                'SELECT * FROM Guest_Image_Limits WHERE ip_address = ?',
                [ipAddress]
            );
            return(rows[0]) ; // Returning fetched rows
        } catch (error) {
            console.error('Error fetching guest user:', error.message);
            throw error;
        } 
}