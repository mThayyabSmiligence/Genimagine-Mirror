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
