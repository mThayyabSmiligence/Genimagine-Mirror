const db = require('../config/connectDatabase');

exports.getAllStylesService = async () => {
  try {
    const [rows] = await db.execute(`SELECT id, name, image_path, is_active, created_at, updated_at FROM styles ORDER BY id ASC`);
    return { status: 200, success: true, message: "Styles fetched", data: rows };
  } catch (error) {
    console.error("getAllStylesService error:", error);
    return { status: 500, success: false, message: "Database error" };
  }
};

exports.getStyleByIdService = async (styleId) => {
  try {
    const [rows] = await db.execute(`SELECT id, name, image_path, is_active, created_at, updated_at FROM styles WHERE id = ?`, [styleId]);
    if (rows.length === 0) {
      return { status: 404, success: false, message: "Style not found" };
    }
    return { status: 200, success: true, message: "Style fetched", data: rows[0] };
  } catch (error) {
    console.error("getStyleByIdService error:", error);
    return { status: 500, success: false, message: "Database error" };
  }
};


exports.createStyleService = async ({ name, image_path, is_active = 1 }) => {
  try {
    await db.execute(`INSERT INTO styles (name, image_path, is_active) VALUES (?, ?, ?)`, [name, image_path, is_active]);
    return { status: 201, success: true, message: "Style created successfully" };
  } catch (error) {
    console.error("createStyleService error:", error);
    return { status: 500, success: false, message: "Failed to create style" };
  }
};

exports.updateStyleService = async (styleId, { name, image_path, is_active }) => {
  try {
    await db.execute(`UPDATE styles SET name = ?, image_path = ?, is_active = ? WHERE id = ?`, [name, image_path, is_active, styleId]);
    return { status: 200, success: true, message: "Style updated successfully" };
  } catch (error) {
    console.error("updateStyleService error:", error);
    return { status: 500, success: false, message: "Failed to update style" };
  }
};

exports.deleteStyleService = async (styleId) => {
  try {
    await db.execute(`DELETE FROM styles WHERE id = ?`, [styleId]);
    return { status: 200, success: true, message: "Style deleted successfully" };
  } catch (error) {
    console.error("deleteStyleService error:", error);
    return { status: 500, success: false, message: "Failed to delete style" };
  }
};
