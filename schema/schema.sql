-- Run this against your D1 database:
-- wrangler d1 execute solace-db --file=schema/schema.sql

CREATE TABLE IF NOT EXISTS advisors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body TEXT NOT NULL,
  topic TEXT,
  status TEXT DEFAULT 'new',  -- new | answered | dismissed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  advisor_id INTEGER NOT NULL REFERENCES advisors(id),
  body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  advisor_id INTEGER NOT NULL REFERENCES advisors(id),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed a default advisor (password: changeme123)
-- Generate a real hash with: node -e "require('crypto').createHash('sha256').update('changeme123').digest('hex')"
-- Or use the /api/setup endpoint once deployed (disabled after first use)
