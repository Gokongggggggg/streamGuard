/**
 * Database Schema Initialization
 * 
 * Run this once to create all tables:
 *   node db/init.js
 * 
 * Tables:
 *   users        — streamer accounts
 *   donations    — all donations (passed + blocked)
 *   blocklist    — custom blocked words per user
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

const schema = `
  -- Users table (streamers)
  CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username      VARCHAR(100),
    
    -- Unique tokens for webhook and overlay
    webhook_token VARCHAR(64) UNIQUE NOT NULL,
    overlay_token VARCHAR(64) UNIQUE NOT NULL,
    
    -- Settings
    filter_enabled  BOOLEAN DEFAULT true,
    
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
  );

  -- Donations table (all donations, passed and blocked)
  CREATE TABLE IF NOT EXISTS donations (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Donation data from Saweria
    provider      VARCHAR(50) DEFAULT 'saweria',
    donation_id   VARCHAR(255),
    donator_name  VARCHAR(255),
    amount        INTEGER DEFAULT 0,
    message       TEXT,
    
    -- Filter result
    blocked       BOOLEAN DEFAULT false,
    filter_reason VARCHAR(500),
    filter_layer  VARCHAR(50),
    confidence    REAL DEFAULT 0,
    
    -- Manual review
    manually_approved BOOLEAN DEFAULT false,
    
    created_at    TIMESTAMP DEFAULT NOW()
  );

  -- Custom blocklist per user
  CREATE TABLE IF NOT EXISTS blocklist (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
    word          VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, word)
  );

  -- Index for faster queries
  CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
  CREATE INDEX IF NOT EXISTS idx_donations_blocked ON donations(user_id, blocked);
  CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_blocklist_user_id ON blocklist(user_id);
`;

async function initDB() {
  try {
    console.log("Connecting to database...");
    await pool.query(schema);
    console.log("Database schema initialized successfully!");
    console.log("");
    console.log("Tables created:");
    console.log("  - users       (streamer accounts + tokens)");
    console.log("  - donations   (all donations with filter results)");
    console.log("  - blocklist   (custom blocked words per user)");
  } catch (err) {
    console.error("Failed to initialize database:", err.message);
  } finally {
    await pool.end();
  }
}

initDB();
