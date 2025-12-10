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
            await createSlideForModule(specModule.module_id,spec_id,user_id)
            console.log("slide created for module: ", specModule.module_id)
        })
    }
    catch (err) {
         throw new AppError(err.message||"Something went wrong with creating new slide", 500)
    }
}
const path = require("path");
// ...
const createSlideForModule = async (module_id,spec_id,user_id) => {
  try {
    const learningObjectives = await AiLearningObjective.findAll({ where: { module_id } });
    console.log("learnig", learningObjectives)

    let slideCounter = await AiLearningSlide.count({
      where: { module_id }
    });

    console.log("Starting slide counter from:", slideCounter);

    // await Promise.all(learningObjectives.map(lo => generateSlide(lo.dataValues,spec_id,user_id)));
    for (const lo of learningObjectives) {
      slideCounter = await generateSlide(
        lo.dataValues,
        spec_id,
        user_id,
        slideCounter     // passing counter
      );
    }
  } catch (err) {
    throw new AppError(err.message || "Something went wrong with creating new slide", 500);
  }
};

const generateSlide = async (learningObjective,spec_id,user_id,slideCounter) => {
  try {
    const normalizedLearningObjectives = {
      title: learningObjective.title,
      description: learningObjective.description,
      content: learningObjective.content,
    };

    const pages = moduleToPages(normalizedLearningObjectives);

    // const existingSlidesCount = await AiLearningSlide.count({
    //   where: { module_id: learningObjective.module_id }
    // });

    // let slideCounter = existingSlidesCount||0;

    const slidesDir = path.join(__dirname, "../../../outputs/slides"); // adjust if you want another location
    await fs.promises.mkdir(slidesDir, { recursive: true });

    console.log("creating slides: ",pages)
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const currentSlideNo = slideCounter; 
      slideCounter++; 

      const html = getSlideHtml(page);
      const imagePath =await convertToHtmlToImage(html,learningObjective.module_id,learningObjective.id,i);
      
      const upload = await uploadAiLearningSlideImage(imagePath,user_id,spec_id,learningObjective.module_id,learningObjective.id,i);
      console.log("slide uploaded to s3 successfully:",upload);
      if(upload.success === false) throw new AppError(upload.message || "Slide image upload failed", 500)
        // upload has  path , fileUrl, success
      
      await saveSlide({
        module_id: learningObjective.module_id,
        slide_no: currentSlideNo,
        title: learningObjective.title,
        image_url: upload.fileUrl
      })

      console.log("slide saved to db successfully");
      
      // await updateSlideUrl(upload.fileUrl,learningObjective.id)
      
      //  const filePath = path.join(slidesDir, `${learningObjective.module_id}_${learningObjective.id}_${i}.html`);
      //   await fs.promises.writeFile(filePath, html);
      return slideCounter;
    }
  } catch (err) {
    throw new AppError(err.message || "Something went wrong with creating new slide", 500);
  }
};


// const updateSlideUrl= (url,objective_id) =>{
//     try{
//         return AiLearningObjective.update({image_url:url},{where:{id:objective_id}})
//     }catch(err){
//         throw new AppError(err.message||"Something went wrong with updating slide url", 500)
//     }
// }

const saveSlide = async (slide) => {
  try {
    const newSlide = await AiLearningSlide.create(slide);
    return newSlide;
  } catch (err) {
    console.error("Slide create failed:", {
      message: err.message,
      name: err.name,
      errors: err.errors,        // Sequelize validation items
      fields: err.fields,        // for unique constraint, etc.
    });
    throw new AppError(err.message || "Something went wrong with creating new slide", 500);
  }
};

module.exports={
    createSlideForSpec,
    createSlideForModule,
    generateSlide
}