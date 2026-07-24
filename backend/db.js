const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDb() {
  const db = await open({
    filename: path.join(__dirname, 'railsetu.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS trains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT UNIQUE,
      train_name TEXT,
      days_running TEXT
    );

    CREATE TABLE IF NOT EXISTS stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT,
      station_code TEXT,
      station_name TEXT,
      arrival_time TEXT,
      departure_time TEXT,
      day INTEGER,
      stop_number INTEGER,
      distance INTEGER,
      FOREIGN KEY(train_number) REFERENCES trains(train_number)
    );

    CREATE INDEX IF NOT EXISTS idx_station_code ON stops(station_code);
    CREATE INDEX IF NOT EXISTS idx_train_number ON stops(train_number);
  `);

  return db;
}

module.exports = { getDb };
