/**
 * Donation Model
 * 
 * Handles saving donations (passed + blocked) and querying history.
 */

const pool = require("./pool");

const DonationModel = {
  /**
   * Save a donation with its filter result
   */
  async save(userId, donation, filterResult) {
    const result = await pool.query(
      `INSERT INTO donations 
        (user_id, provider, donation_id, donator_name, amount, message, 
         blocked, filter_reason, filter_layer, confidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        donation.provider || "saweria",
        donation.id || null,
        donation.donator || "Anonymous",
        donation.amountDisplay || donation.amount || 0,
        donation.message || "",
        filterResult.blocked,
        filterResult.reason || null,
        filterResult.layer || null,
        filterResult.confidence || 0,
      ]
    );
    return result.rows[0];
  },

  /**
   * Get blocked donations for a user (newest first)
   */
  async getBlocked(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM donations 
       WHERE user_id = $1 AND blocked = true 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  /**
   * Get passed donations for a user (newest first)
   */
  async getPassed(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM donations 
       WHERE user_id = $1 AND blocked = false 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  /**
   * Get all donations for a user (newest first)
   */
  async getAll(userId, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM donations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  /**
   * Get stats for a user
   */
  async getStats(userId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE blocked = true) as blocked,
        COUNT(*) FILTER (WHERE blocked = false) as passed
       FROM donations WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },

  /**
   * Manually approve a blocked donation (false positive)
   */
  async approve(donationId, userId) {
    const result = await pool.query(
      `UPDATE donations 
       SET manually_approved = true, blocked = false 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [donationId, userId]
    );
    return result.rows[0] || null;
  },
};

module.exports = DonationModel;
