// ============================================
// LIB/DB.JS - Database Connection and Setup
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'research.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database connection
let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to SQLite database');
        initSchema();
      }
    });
  }
  return db;
}

// Initialize database schema
function initSchema() {
  const db = getDb();
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Create researches table
  db.run(`
    CREATE TABLE IF NOT EXISTS researches (
      id TEXT PRIMARY KEY,
      ticker TEXT NOT NULL,
      name TEXT,
      address TEXT,
      chain TEXT,
      logo TEXT,
      description TEXT,
      team TEXT,
      use_case TEXT,
      price_data TEXT,
      tokenomics TEXT,
      onchain TEXT,
      red_flags TEXT,
      risk_score INTEGER,
      risk_class TEXT,
      sentiment TEXT,
      sentiment_score INTEGER,
      social_score INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create alerts table
  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      research_id TEXT,
      token TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      change_percent REAL,
      current_price TEXT,
      old_price TEXT,
      sent_to_discord BOOLEAN DEFAULT 0,
      discord_message_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sent_at TIMESTAMP,
      FOREIGN KEY (research_id) REFERENCES researches(id)
    )
  `);
  
  // Create logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create monitoring table
  db.run(`
    CREATE TABLE IF NOT EXISTS monitoring (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      research_id TEXT NOT NULL,
      ticker TEXT NOT NULL,
      baseline_price REAL,
      baseline_volume REAL,
      price_threshold_percentage REAL DEFAULT 50,
      volume_threshold_percentage REAL DEFAULT 500,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_check_at TIMESTAMP
    )
  `);
  
  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_researches_ticker ON researches(ticker)');
  db.run('CREATE INDEX IF NOT EXISTS idx_researches_created ON researches(created_at DESC)');
  db.run('CREATE INDEX IF NOT EXISTS idx_alerts_token ON alerts(token)');
  db.run('CREATE INDEX IF NOT EXISTS idx_monitoring_ticker ON monitoring(ticker)');
}

// Promisify database methods
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Log action
async function logAction(action, details, req) {
  try {
    await run(
      'INSERT INTO logs (action, details, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [action, JSON.stringify(details), req?.headers?.['x-forwarded-for'] || 'unknown', req?.headers?.['user-agent'] || 'unknown']
    );
  } catch (err) {
    console.error('Logging error:', err);
  }
}

module.exports = {
  getDb,
  run,
  get,
  all,
  logAction
};
