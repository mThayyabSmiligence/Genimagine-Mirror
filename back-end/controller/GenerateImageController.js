git const { GuestUserHandler } = require('../service/GuestUserService')
const cookie = require('cookie')

exports.generateImageApiCall = async(req, res) => {
    const cookies = cookie.parse(req.headers.cookie||"")
    const token = cookies.token
    if(!token) {
        GuestUserHandler(req.headers.ipAddress);
    } else {
        console.log(token);
    }
} 