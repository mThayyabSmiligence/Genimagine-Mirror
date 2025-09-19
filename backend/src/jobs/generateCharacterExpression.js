const queue = require("../config/queue");
const { GeneratedImage, GenerationBatch, CharacterExpressionImage, ImageGenerationBatch } = require("../models");
const { paidGenerateImageService } = require("../service/PaidGenerateImageService");
const generateAIImage = require("../services/aiService");

queue.process("generateCharacterExpression", async (job) => {
  const { batchId } = job.data;
  const images = await CharacterExpressionImage.findAll({ where: { batch_id: batchId, status: "queued" } });

  for (const img of images) {
    try {
      img.status = "processing";
      await img.save();

      const generatedPath = await paidGenerateImageService(img, generateAIImage);
      img.url = generatedPath;
      img.status = "done";
      await img.save();
    } catch (err) {
      img.status = "failed";
      img.error_message = err.message;
      await img.save();
    }
  }

  await ImageGenerationBatch.update({ status: "completed" }, { where: { id: batchId } });
});
