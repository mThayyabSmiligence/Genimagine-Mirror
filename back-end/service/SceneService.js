// services/sceneService.js
const db = require('../config/connectDatabase');
const { paidGenerateImageService } = require("../service/PaidGenerateImageService");

exports.generateSceneService = async (user_id, characters, prompt) => {
  try {
    /**
     * characters = [
     *   { character_id: 1, pose_id: 2, expression_id: 3 },
     *   { character_id: 2, pose_id: null, expression_id: 5 }
     * ]
     */

    // 1. Get reference images for each character
    let initImages = [];

    for (let ch of characters) {
      const [charRows] = await db.execute(
        "SELECT reference_image_url FROM characters WHERE character_id=?",
        [ch.character_id]
      );
      if (charRows.length === 0) continue;

      let initImageUrl = charRows[0].reference_image_url;

      if (ch.pose_id) {
        const [poseRows] = await db.execute(
          "SELECT reference_image_url FROM poses WHERE pose_id=?",
          [ch.pose_id]
        );
        if (poseRows.length > 0 && poseRows[0].reference_image_url) {
          initImageUrl = poseRows[0].reference_image_url;
        }
      }

      if (ch.expression_id) {
        const [expRows] = await db.execute(
          "SELECT reference_image_url FROM expressions WHERE expression_id=?",
          [ch.expression_id]
        );
        if (expRows.length > 0 && expRows[0].reference_image_url) {
          initImageUrl = expRows[0].reference_image_url;
        }
      }

      initImages.push(initImageUrl);
    }

    // 2. Build input for Cloudflare AI
    // For now: just use the first image as init (basic implementation).
    // Later: can merge multiple initImages into a composite base image.
    const inputs = {
      prompt,
      image: initImages[0], // TODO: extend to multi-character layering
      strength: 0.7,
      guidance: 7.5,
    };

    const buffer = await paidGenerateImageService(
      inputs,
      "@cf/runwayml/stable-diffusion-v1-5-img2img"
    );

    if (!buffer) {
      return { status: 500, success: false, message: "Image generation failed" };
    }

    // TODO: Save buffer to storage (S3, local, etc.)
    const generatedImageUrl = "your-storage-url/" + Date.now() + ".png";

    // 3. Insert into scenes
    const [sceneResult] = await db.execute(
      "INSERT INTO scenes (user_id, prompt, generated_image_url) VALUES (?, ?, ?)",
      [user_id, prompt, generatedImageUrl]
    );

    const scene_id = sceneResult.insertId;

    // 4. Insert characters into scene_characters
    for (let ch of characters) {
      await db.execute(
        "INSERT INTO scene_characters (scene_id, character_id, pose_id, expression_id) VALUES (?, ?, ?, ?)",
        [scene_id, ch.character_id, ch.pose_id || null, ch.expression_id || null]
      );
    }

    return {
      status: 201,
      success: true,
      message: "Scene generated",
      scene_id,
      generated_image_url: generatedImageUrl,
    };
  } catch (err) {
    console.error("Error in generateSceneService", err);
    return { status: 500, success: false, message: "Error generating scene" };
  }
};

exports.getScenesService = async (user_id) => {
  try {
    const [scenes] = await db.execute(
      "SELECT scene_id, prompt, generated_image_url, created_at FROM scenes WHERE user_id=? ORDER BY created_at DESC",
      [user_id]
    );

    for (let scene of scenes) {
      const [chars] = await db.execute(
        `SELECT sc.character_id, c.name AS character_name, 
                sc.pose_id, p.pose_name, 
                sc.expression_id, e.emotion
         FROM scene_characters sc
         JOIN characters c ON sc.character_id = c.character_id
         LEFT JOIN poses p ON sc.pose_id = p.pose_id
         LEFT JOIN expressions e ON sc.expression_id = e.expression_id
         WHERE sc.scene_id=?`,
        [scene.scene_id]
      );
      scene.characters = chars;
    }

    return { status: 200, success: true, data: scenes };
  } catch (err) {
    console.error("Error in getScenesService", err);
    return { status: 500, success: false, message: "Error fetching scenes" };
  }
};
