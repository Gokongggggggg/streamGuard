/**
 * User Model
 * 
 * Handles user registration, login, and token-based lookups.
 * Each user gets a unique webhook_token and overlay_token on registration.
 */

const pool = require("./pool");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const SALT_ROUNDS = 10;

/**
 * Generate a short unique token (no dashes, URL-safe)
 */
function generateToken() {
  return uuidv4().replace(/-/g, "");
}

const UserModel = {
  /**
   * Register a new user
   * Returns the created user (without password)
   */
  async register(email, password, username) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const webhookToken = generateToken();
    const overlayToken = generateToken();

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, webhook_token, overlay_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, webhook_token, overlay_token, filter_enabled, created_at`,
      [email, passwordHash, username || null, webhookToken, overlayToken]
    );

    return result.rows[0];
  },

  /**
   * Login — verify email + password
   * Returns user if valid, null if invalid
   */
  async login(email, password) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    // Don't return password hash
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Find user by webhook token (used when Saweria sends webhook)
   */
  async findByWebhookToken(token) {
    const result = await pool.query(
      `SELECT id, email, username, webhook_token, overlay_token, filter_enabled
       FROM users WHERE webhook_token = $1`,
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Find user by overlay token (used when overlay page connects)
   */
  async findByOverlayToken(token) {
    const result = await pool.query(
      `SELECT id, email, username, webhook_token, overlay_token, filter_enabled
       FROM users WHERE overlay_token = $1`,
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const result = await pool.query(
      `SELECT id, email, username, webhook_token, overlay_token, filter_enabled, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Toggle filter on/off
   */
  async toggleFilter(userId, enabled) {
    await pool.query(
      `UPDATE users SET filter_enabled = $1, updated_at = NOW() WHERE id = $2`,
      [enabled, userId]
    );
  },
};

module.exports = UserModel;
