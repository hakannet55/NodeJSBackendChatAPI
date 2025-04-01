// db.js
const sqlite3 = require('sqlite3').verbose();  // SQLite3 modülünü içe aktar

// Veritabanını in-memory olarak başlatıyoruz
const db = new sqlite3.Database(':memory:');

// Tabloları oluştur
const createTables = () => {
  db.serialize(() => {
    // Kullanıcılar tablosu
    db.run(`
      CREATE TABLE IF NOT EXISTS tbl_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Mesajlar tablosu
    db.run(`
      CREATE TABLE IF NOT EXISTS tbl_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        message TEXT NOT NULL,
        senderId TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES tbl_users(id)
      );
    `);
  });
};

// Veritabanı bağlantısı ve tabloları oluşturma
createTables();

// Veritabanı işlemleri için yardımcı fonksiyonlar
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

const tabNameEnums = {
  tbl_products: 'tbl_products',
  tbl_users: 'tbl_users',
  tbl_messages: 'tbl_messages'
};

module.exports = { db, query,tabNameEnums };
