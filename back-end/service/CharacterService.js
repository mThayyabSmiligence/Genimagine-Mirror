const db = require('../config/connectDatabase');

exports.createCharacterService = async (user_id, name, reference_image_url, description) => {
  try {
    const query = "INSERT INTO characters (user_id, name, reference_image_url, description) VALUES (?, ?, ?, ?)";
    const [result] = await db.execute(query, [user_id, name, reference_image_url, description]);
    return { status: 201, success: true, message: "Character created", character_id: result.insertId };
  } catch (err) {
    console.error("Error in createCharacterService", err);
    return { status: 500, success: false, message: "Error creating character" };
  }
};

exports.addExpressionService = async (character_id, emotion, reference_image_url) => {
  try {
    const query = "INSERT INTO expressions (character_id, emotion, reference_image_url) VALUES (?, ?, ?)";
    await db.execute(query, [character_id, emotion, reference_image_url]);
    return { status: 201, success: true, message: "Expression added" };
  } catch (err) {
    console.error("Error in addExpressionService", err);
    return { status: 500, success: false, message: "Error adding expression" };
  }
};

exports.addPoseService = async (character_id, pose_name, reference_image_url) => {
  try {
    const query = "INSERT INTO poses (character_id, pose_name, reference_image_url) VALUES (?, ?, ?)";
    await db.execute(query, [character_id, pose_name, reference_image_url]);
    return { status: 201, success: true, message: "Pose added" };
  } catch (err) {
    console.error("Error in addPoseService", err);
    return { status: 500, success: false, message: "Error adding pose" };
  }
};

exports.getCharactersService = async (user_id) => {
  try {
    const query = "SELECT * FROM characters WHERE user_id=?";
    const [rows] = await db.execute(query, [user_id]);
    return { status: 200, success: true, data: rows };
  } catch (err) {
    console.error("Error in getCharactersService", err);
    return { status: 500, success: false, message: "Error fetching characters" };
  }
};
