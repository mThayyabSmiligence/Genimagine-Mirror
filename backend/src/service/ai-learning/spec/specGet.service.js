const { AiLearningSpec } = require("../../../models")
const AppError = require("../../../utils/AppError")

const getAiLearningByUserIdService = async(user_id) => {
    try{
        let specs = await AiLearningSpec.findAll({where:{user_id}})
        specs = specs.map((item) => item.dataValues)
        return specs
    }catch(err){
        throw new AppError(err.message||"Something went wrong with getting ai learning by user id", 500)
    }
}

module.exports = {getAiLearningByUserIdService}