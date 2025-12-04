const { AiLearningSpec, AiLearningSpecModule, AiLearningObjective, AiLearningSlide } = require("../../../models")
const AppError = require("../../../utils/AppError")
const { uploadAiLearningSlideImage } = require("../../S3Service")
const { moduleToPages, getSlideHtml, convertToHtmlToImage } = require("./slidesCreat.service")
const fs = require("fs")

const createSlideForSpec = async (spec_id,user_id) => {
    try {
        const specsModules = await AiLearningSpecModule.findAll({where:{spec_id}})

        const createMoules = specsModules.map(async specModule=> {
            console.log("creating slide for module: ", specModule.module_id),
            await createSlideForModule(specModule.module_id,user_id)
            console.log("slide created for module: ", specModule.module_id)
        })
    }
    catch (err) {
         throw new AppError(err.message||"Something went wrong with creating new slide", 500)
    }
}
const path = require("path");
// ...
const createSlideForModule = async (module_id,user_id) => {
  try {
    const learningObjectives = await AiLearningObjective.findAll({ where: { module_id } });
    await Promise.all(learningObjectives.map(lo => generateSlide(lo.dataValues,user_id)));
  } catch (err) {
    throw new AppError(err.message || "Something went wrong with creating new slide", 500);
  }
};

const generateSlide = async (learningObjective,user_id) => {
  try {
    const normalizedLearningObjectives = {
      title: learningObjective.title,
      description: learningObjective.description,
      content: learningObjective.content,
    };

    const pages = moduleToPages(normalizedLearningObjectives);
    const slidesDir = path.join(__dirname, "../../../outputs/slides"); // adjust if you want another location
    await fs.promises.mkdir(slidesDir, { recursive: true });

    console.log("creating slides: ",pages)
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const html = getSlideHtml(page);
      const imagePath =await convertToHtmlToImage(html,learningObjective.module_id,learningObjective.id,i);
      
      const upload = await uploadAiLearningSlideImage(imagePath,user_id,learningObjective.module_id,learningObjective.id,learningObjective.id,i);
      if(upload.success === false) throw new AppError(upload.message || "Slide image upload failed", 500)

      // await updateSlideUrl(upload.fileUrl,learningObjective.id)
      
      // const filePath = path.join(slidesDir, `${learningObjective.module_id}_${learningObjective.id}_${i}.html`);
      // await fs.promises.writeFile(filePath, html);
    }
  } catch (err) {
    throw new AppError(err.message || "Something went wrong with creating new slide", 500);
  }
};


const updateSlideUrl= (url,objective_id) =>{
    try{
        return AiLearningObjective.update({image_url:url},{where:{id:objective_id}})
    }catch(err){
        throw new AppError(err.message||"Something went wrong with updating slide url", 500)
    }
}

const saveSlide = async (slide) => {
  try {
    const newSlide = await AiLearningSlide.create(slide);
    return newSlide;
  } catch (err) {
    throw new AppError(err.message || "Something went wrong with creating new slide", 500);
  }
};

module.exports={
    createSlideForSpec,
    createSlideForModule,
    generateSlide
}