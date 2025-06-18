const db = require('../config/connectDatabase');
const { S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const path = require('path');

exports.getAllStylesService = async () => {
  try {
    const [rows] = await db.execute(`SELECT id, name, image_path, is_active, is_deleted, created_at, updated_at FROM styles ORDER BY id ASC`);
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


// exports.createStyleService = async ({ name, image_path, is_active }) => {
//   try {
//     await db.execute(`INSERT INTO styles (name, image_path, is_active) VALUES (?, ?, ?)`, [name, image_path, is_active]);
//     return { status: 201, success: true, message: "Style created successfully" };
//   } catch (error) {
//     console.error("createStyleService error:", error);
//     return { status: 500, success: false, message: "Failed to create style" };
//   }
// };

// exports.updateStyleService = async (styleId, { name, image_path, is_active }) => {
//   try {
//     await db.execute(`UPDATE styles SET name = ?, image_path = ?, is_active = ? WHERE id = ?`, [name, image_path, is_active, styleId]);
//     return { status: 200, success: true, message: "Style updated successfully" };
//   } catch (error) {
//     console.error("updateStyleService error:", error);
//     return { status: 500, success: false, message: "Failed to update style" };
//   }
// };

const uploadToS3 = async (fileBuffer, filename, mimetype) => {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: `style/${filename}`,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
};

exports.createStyleService = async ({ name, image_path, is_active }, file) => {
  try {
    if (!name || !image_path || !file) {
      return { status: 400, success: false, message: 'All fields including image are required' };
    }

    const ext = path.extname(image_path).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!allowed.includes(ext)) {
      return { status: 400, success: false, message: 'Invalid image format' };
    }

    await uploadToS3(file.buffer, image_path, file.mimetype);

    await db.execute(
      `INSERT INTO styles (name, image_path, is_active) VALUES (?, ?, ?)`,
      [name, image_path, is_active]
    );

    return { status: 201, success: true, message: 'Style created successfully' };
  } catch (error) {
    console.error('createStyleService error:', error);
    return { status: 500, success: false, message: 'Failed to create style' };
  }
};

exports.updateStyleService = async (styleId, { name, image_path, is_active }, file) => {
  try {
    if (!name || !image_path) {
      return { status: 400, success: false, message: 'Style name and image path are required' };
    }

    if (file) {
      const ext = path.extname(image_path).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
      if (!allowed.includes(ext)) {
        return { status: 400, success: false, message: 'Invalid image format' };
      }

      await uploadToS3(file.buffer, image_path, file.mimetype);
    }

    await db.execute(
      `UPDATE styles SET name = ?, image_path = ?, is_active = ? WHERE id = ?`,
      [name, image_path, is_active, styleId]
    );

    return { status: 200, success: true, message: 'Style updated successfully' };
  } catch (error) {
    console.error('updateStyleService error:', error);
    return { status: 500, success: false, message: 'Failed to update style' };
  }
};


exports.deleteStyleService = async (styleId) => {
  try {
    const [check] = await db.query(
      `SELECT is_deleted FROM styles WHERE id = ?`,
      [styleId]
    );

    if (!check.length) {
      return {
        status: 404,
        success: false,
        message: "Style not found",
      };
    }

    if (check[0].is_deleted === 1) {
      return {
        status: 400,
        success: false,
        message: "Style is already deleted",
      };
    }

    await db.execute(`UPDATE styles SET is_deleted = 1, is_active = 0 WHERE id = ?`, [styleId]);

    return { status: 200, success: true, message: "Style deleted successfully" };

  } catch (error) {
    console.error("deleteStyleService error:", error);
    return { status: 500, success: false, message: "Failed to delete style" };
  }
};
