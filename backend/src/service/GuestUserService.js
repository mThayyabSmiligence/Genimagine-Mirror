const db = require('../config/connectDatabase');

const dotenv =require('dotenv')
const path =require('path')

dotenv.config({path: path.join(__dirname, 'config', 'config.env')})


const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID
const cloud_flare_api_key=process.env.CLOUD_FLARE_API_KEY

exports.GuestUserHandler = async (ipAddress) => {
    try {
        const dataExists = await checkDataExists(ipAddress);
        if (!dataExists) {
            const result = await createGuestUser(ipAddress);
            console.log(`New guest user created with IP Address: ${ipAddress}, Insert ID: ${result.insertId}`);
            return true;
        } else {
            let guestUserData = await GetGuestUser(ipAddress);

            if (guestUserData.image_count < 10) {
                console.log("user has enough limits to generate image");
                return true;
            } else {
                console.log("Not enough limits to generate image");
                return false
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
            'SELECT COUNT(*) AS count FROM guest_image_limits WHERE ip_address = ?',
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
            'INSERT INTO guest_image_limits (ip_address, image_count) VALUES (?,?)',
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
            'SELECT * FROM guest_image_limits WHERE ip_address = ?',
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
                        UPDATE guest_image_limits 
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