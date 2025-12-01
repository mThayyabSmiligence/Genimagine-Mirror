const fs = require("fs");
const path = require("path");
const AppError = require("../../../utils/AppError");
const { generateModuleContent } = require("../llm/generateModuleContent.service");

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

        let index = 0;
        for(const module of modules){
            const moduleData = module?.dataValues || module;
            const module_content = await generateModuleContent(moduleData);
            const fileSuffix = moduleData?.id || slug(moduleData?.title) || index;
            const filePath = path.join(OUTPUT_DIR, `module_content_${fileSuffix}.json`);

            await fs.promises.writeFile(filePath, JSON.stringify(module_content, null, 2), "utf8");
            console.log("module content saved to:", filePath);
            index += 1;
        }
        return modules;
    }
    catch(err){
        throw new AppError(err.message||"Something went wrong with saving ai learning modules", 500)
    }
}

module.exports = {generateCandidateModulesContent}
