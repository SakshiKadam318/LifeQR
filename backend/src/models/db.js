const Database = require('better-sqlite3');

const db = new Database('users.db');

// Users table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Profiles table
db.prepare(`
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    date_of_birth TEXT,
    gender TEXT,
    blood_type TEXT,
    allergies TEXT,
    medical_conditions TEXT,
    current_medications TEXT,
    doctor_name TEXT,
    doctor_phone TEXT,
    organ_donor INTEGER DEFAULT 0,
    address TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// Emergency contacts table
db.prepare(`
  CREATE TABLE IF NOT EXISTS emergency_contacts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// QR tokens table
db.prepare(`
  CREATE TABLE IF NOT EXISTS qr_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// Scan logs table
db.prepare(`
  CREATE TABLE IF NOT EXISTS scan_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    qr_token TEXT NOT NULL,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
  )
`).run();

console.log("✅ Database connected successfully");

module.exports = db;