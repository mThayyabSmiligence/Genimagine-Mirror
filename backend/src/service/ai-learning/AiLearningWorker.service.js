const { AiLearningSpec } = require("../../models");
const { generateCandidateModules } = require("./llm/specUnderstanding.service");
const { parseDocumentForSpec } = require("./media/documentPrasing.service");
const { generateCandidateModulesContent } = require("./module/modulePipeline.service");
const { saveAiLearningModules } = require("./module/moduleUpload.service");
const { saveSpecModules } = require("./spec_modules/SpecModuleUpload.service");

const startAiLearningWorker = async (spec_id, user_id, job_id) => {
    let specs= null;
    try{
        specs = await AiLearningSpec.findOne({where:{id:spec_id,user_id}});
        console.log(specs.dataValues);
        if(!specs){
            throw new Error("Spec not found");
        }

        const text = await parseDocumentForSpec(specs.storage_url);
        console.log(text);

        const modules = await generateCandidateModules({specId:spec_id,text,generationType:specs.generation_type});

        const savedModules = await saveAiLearningModules({modules,user_id,spec_id,job_id});
        console.log("saved modules:",savedModules);

        const savedSpecModules = await saveSpecModules(savedModules,spec_id);
        console.log("saved spec modules:",savedSpecModules);

        const modules_content = await generateCandidateModulesContent({modules,user_id,spec_id,job_id});
    }catch(err){
        console.log(err)
    }
}

module.exports = { startAiLearningWorker };