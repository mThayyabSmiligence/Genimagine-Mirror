const db = require('../config/connectDatabase');

/**
 * Create a new story
 */
exports.createStory = async ({ user_id, title }) => {
  const q = `INSERT INTO stories (user_id, title) VALUES (?, ?)`;
  const [result] = await db.execute(q, [user_id, title]);
  return { id: result.insertId, user_id, title };
};

/**
 * Get all stories of a user
 */
exports.getUserStories = async (user_id) => {
  const q = `SELECT * FROM stories WHERE user_id = ? ORDER BY created_at DESC`;
  const [rows] = await db.execute(q, [user_id]);
  return rows;
};

/**
 * Get a single story by ID for a user
 */
exports.getStoryById = async (story_id, user_id) => {
  const q = `SELECT * FROM stories WHERE id = ? AND user_id = ?`;
  const [rows] = await db.execute(q, [story_id, user_id]);
  return rows.length ? rows[0] : null;
};
