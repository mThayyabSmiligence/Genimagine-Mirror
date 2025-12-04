const { AiLearningObjective } = require("../../../models");
const AppError = require("../../../utils/AppError");


const bulkSaveLearningObjectives = async({module_content, module_id})=>{
    try{
        const objectivesToSave = module_content.map((objective, index)=>({
            title: objective.objective_title,
            description: objective.objective_description,
            module_id,
            order_index: index,
            content: objective.blocks
        }));
        // console.log("objectivesToSave",objectivesToSave);
        const savedObjectives = await AiLearningObjective.bulkCreate(objectivesToSave);
        for (const objective of savedObjectives) {
            console.log("objective saved: ", objective.dataValues.id);
        }
        return savedObjectives;
    }
    catch(err){
        throw new AppError(err.message||"Something went wrong with saving learning objectives", 500)
    }
}

module.exports = {
    bulkSaveLearningObjectives
}

