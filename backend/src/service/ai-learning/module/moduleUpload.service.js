const { AiLearningModule } = require("../../../models");
const AppError = require("../../../utils/AppError");

// Basic slug helper to build a stable canonical key from the title
const slug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


const saveAiLearningModules = async ({modules,user_id,spec_id,job_id}) =>{
    try{
    

        const modulesToSave = modules.map(module=>({
            ...module,
            origin_spec_id:spec_id,
            origin_job_id:job_id,
            canonical_key: slug(module.title) + ':' + module.difficulty
        }))
        const savedModules = await AiLearningModule.bulkCreate(modulesToSave);
        console.log("saved modules:",savedModules);
        return savedModules;
    }catch(err){
        throw new AppError(err.message||"Something went wrong with saving ai learning modules", 500)
    }
}
module.exports = {saveAiLearningModules}
