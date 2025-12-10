const fs = require("fs");
const path = require("path");

const { generateModuleContent } = require("../llm/generateModuleContent.service");
const { bulkSaveLearningObjectives } = require("../learning_objectives/LearningObjectiveUpload.service");
const AppError = require("../../../utils/AppError");

const OUTPUT_DIR = path.join(__dirname, "module_content");

const slug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const generateCandidateModulesContent = async ({modules,user_id,spec_id,job_id}) => {
    try{
        await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

        for (let i = 0; i < modules.length; i += 1) {
            const moduleData = modules[i]?.dataValues || modules[i];
            console.log("generating module content for module:", moduleData.id || moduleData.title);

            let extractCount = 0;
            let module_content = null;
            let MAX_EXTRACT_ATTEMPTS = 5;

            while (extractCount < MAX_EXTRACT_ATTEMPTS) {
                if (extractCount > 0) {
                    console.log(`Retrying module content generation... Attempt ${extractCount + 1}`);
                }

                module_content = await generateModuleContent(moduleData);
                console.log("module content:", module_content)


                if (Array.isArray(module_content) && module_content.length > 0) {
                    break;
                }

                extractCount++;

                // if (!Array.isArray(module_content) || module_content.length === 0) {
                //     throw new AppError(
                //     `Module content empty/invalid for module ${moduleData.id || moduleData.title}`,
                //     500
                //     );
                // }
            } 

            if (!Array.isArray(module_content) || module_content.length === 0) {
                throw new AppError(
                    `Failed to generate module content after ${MAX_EXTRACT_ATTEMPTS} attempts for ${moduleData.id || moduleData.title}`,
                    500
                );
            }

            // console.log(`Module ${moduleData.id || moduleData.title}:`, module_content);

            // if (!module_content || !Array.isArray(module_content) || module_content.length === 0) {
            //     throw new AppError(`Failed to generate module content after 5 attempts for ${moduleData.id || moduleData.title}`, 500);
            // }
            await bulkSaveLearningObjectives({ module_content, module_id: moduleData.id });

            // const fileSuffix = moduleData?.id || slug(moduleData?.title) || i;
            // const filePath = path.join(OUTPUT_DIR, `module_content_${fileSuffix}.json`);
            // await fs.promises.writeFile(filePath, JSON.stringify(module_content, null, 2), "utf8");
            // console.log("module content saved to:", filePath);
        }


        // await Promise.all(
        //     modules.map(async (module, index) => {
        //         const moduleData = module?.dataValues || module;
        //         console.log("generating module content for module: ", moduleData.id || moduleData.title);
        //         const module_content = await generateModuleContent(moduleData);

        //         if (!Array.isArray(module_content) || module_content.length === 0) {
        //             throw new AppError(
        //                 `Module content empty/invalid for module ${moduleData.id || moduleData.title}`,
        //                 500
        //             );
        //         }
        //         // console.log("module_content",moduleData);
        //         await bulkSaveLearningObjectives({module_content,module_id:moduleData.id});

        //         const fileSuffix = moduleData?.id || slug(moduleData?.title) || index;
        //         const filePath = path.join(OUTPUT_DIR, `module_content_${fileSuffix}.json`);

        //         await fs.promises.writeFile(filePath, JSON.stringify(module_content, null, 2), "utf8");
        //         console.log("module content saved to:", filePath);
        //     })
        // );
        return modules;
    }
    catch(err){
        throw new AppError(err.message||"Something went wrong with saving ai learning modules", 500)
    }
}

module.exports = {generateCandidateModulesContent}
