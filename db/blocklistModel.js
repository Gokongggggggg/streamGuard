/**
 * Blocklist Model
 * 
 * Handles per-user custom blocked words.
 */

const pool = require("./pool");

const BlocklistModel = {
  /**
   * Get all blocked words for a user
   */
  async getWords(userId) {
    const result = await pool.query(
      `SELECT word FROM blocklist WHERE user_id = $1 ORDER BY word`,
      [userId]
    );
    return result.rows.map((r) => r.word);
  },

  /**
   * Add a word to user's blocklist
   */
  async addWord(userId, word) {
    const result = await pool.query(
      `INSERT INTO blocklist (user_id, word) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, word) DO NOTHING
       RETURNING *`,
      [userId, word.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },

  /**
   * Remove a word from user's blocklist
   */
  async removeWord(userId, word) {
    const result = await pool.query(
      `DELETE FROM blocklist WHERE user_id = $1 AND word = $2 RETURNING *`,
      [userId, word.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  },
};

module.exports = BlocklistModel;
