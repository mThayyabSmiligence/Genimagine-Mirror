const { Users } = require("../models")

const testUserModel= async(req,res) => {
  
    const user =await Users.findByPk(79);
    res.status(200).json({
        message:"success",
        user
    })
}

module.exports={testUserModel}