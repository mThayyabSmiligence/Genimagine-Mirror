const { getFromRedis } = require("../../../helper/redis.helper")
const { AiLearningObjective, AiLearningSpecModule } = require("../../../models")
const AppError = require("../../../utils/AppError")
const retryAsync = require("../../../utils/retryAsync")
const generateNarrationForLearningObjective = require("../llm/generateNarration.service")

const createVideoForModules = async (spec_id, user_id) => {
    try {
        const specsModules = await AiLearningSpecModule.findAll({where:{spec_id}})

        for (const specModule of specsModules) {
        // for (let i = 0; i < specsModules.length; i++) {
        //     const specModule = specsModules[i];
            const narration = await generateNarrationForAiLearning_LO(specModule.module_id, spec_id, user_id);
            console.log("🎬 Narration generated for module:", specModule.module_id);

            const audio =  await generateAudioForAiLearning_Narrations(narration);
            console.log("🎵 Audio generated ");

        }

    }
    catch (err) {
         throw new AppError(err.message||"Something went wrong with creating video", 500)
    }
}

const generateNarrationForAiLearning_LO = async (module_id, spec_id, user_id) => {
    try {
        const learningObjectives = await AiLearningObjective.findAll({
            where: { module_id }
        });

        for (const learningObjective of learningObjectives) {

            const storedPages = await getFromRedis(
                `ai_learning:lo:${learningObjective.id}:pages`
            );

            console.log("📥 Pages Retrieved From Redis:", JSON.stringify(storedPages));

            if (!storedPages || storedPages.length === 0) {
                throw new Error(
                    `No stored pages found in Redis for narration. LO ID: ${learningObjective.id}`
                );
            }

            // const narration = await retryAsync(
            //     () => generateNarrationForLearningObjective(learningObjective, storedPages, spec_id, user_id),
            //     {
            //         retries: 5,
            //         onRetry: (err, attempt) => {
            //         console.log(`Retrying narration... Attempt ${attempt + 1}`);
            //         console.error(err.message||err);
            //         }
            //     }
            // );
            
            
            const narration = await generateNarrationForLearningObjective(learningObjective, storedPages, spec_id, user_id);

            console.log("📤 Narration Generated:", narration);

            if (!Array.isArray(narration) || narration.length === 0) {
                throw new AppError(
                    `Failed to generate narration for learning objective. LO ID: ${learningObjective.id}`,
                    500
                );
            }

            return narration;
            
            // Continue narration generation here...
            // e.g., combine text, send to LLM, save narration, etc.
        }

        console.log("📘 Narration generation completed for module:", module_id);;
    }
    catch (err) {
        console.log("🚫 Narration generation failed for module:", module_id,err);
        throw new AppError(err.message || "Something went wrong with generate narration", 500);
    }
};

const generateAudioForAiLearning_Narrations = async (narration, language = "english") => {
    
    console.log("welcome to generate audio")
}

// for deleting from the redis
// await deleteFromRedis(`ai_learning:lo:${learningObjective.id}:pages`);


module.exports={
    createVideoForModules
}