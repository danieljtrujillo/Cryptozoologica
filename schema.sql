-- D1 schema for The Cryptid Journal
-- Run: wrangler d1 execute cryptid-journal --file=./schema.sql

CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cryptid_name TEXT NOT NULL,
  description TEXT NOT NULL,
  location_name TEXT NOT NULL,
  lat REAL DEFAULT 0,
  lng REAL DEFAULT 0,
  address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saved_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cryptid_name TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS saved_locations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_observations_user ON observations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_entries_user ON saved_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_user ON saved_locations(user_id);
