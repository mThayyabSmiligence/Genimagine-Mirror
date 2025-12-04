const { AiLearningSpecModule } = require("../../../models");
const AppError = require("../../../utils/AppError");

const saveSpecModules = async (Modules,spec_id) => {

    try{
        const modulesToSave = Modules.map(module=>({module_id : module.dataValues.id,spec_id}))
        const savedModules = await AiLearningSpecModule.bulkCreate(modulesToSave);
        return savedModules;
    }catch(err){
        throw new AppError(err.message||"Something went wrong with saving spec modules", 500)
    }

};

module.exports={
    saveSpecModules
}