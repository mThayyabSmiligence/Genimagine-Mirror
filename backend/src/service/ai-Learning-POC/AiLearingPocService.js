const { countTokens } = require("../../helper/token.helper");
const { generateSlideImages } = require("./generateSlides");
const { extractTextFromPDF, extractModules } = require("./specExtractor");

exports.createAiLearingPocService=async(pdfBuffer)=>{
    const text = await extractTextFromPDF(pdfBuffer);

    const modules = await extractModules(text);

    const slides = generateSlideImages(modules);

    console.log("no of tokens:", countTokens(text))

    return {text,modules};
}