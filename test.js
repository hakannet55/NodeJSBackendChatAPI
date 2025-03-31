// Gerekli modülleri içeri aktar
const { Pool } = require('pg');

// PostgreSQL bağlantı havuzunu oluştur
const pool = new Pool({
  user: 'postgres',        // PostgreSQL kullanıcı adı
  host: 'localhost',       // PostgreSQL sunucusunun adresi (localhost veya IP adresi)
  database: 'chatapp',     // Bağlanmak istediğiniz veritabanı adı
  password: '123',         // PostgreSQL şifresi
  port: 5432,              // PostgreSQL varsayılan portu (veya kullandığınız port)
});

// Veritabanına bağlantı kurmayı test et
pool.connect()
  .then(client => {
    console.log("Bağlantı başarılı!");
    client.release();  // Bağlantıyı serbest bırak
  })
  .catch(err => {
    console.error("Bağlantı hatası:", err.stack);
  });

// Express veya başka bir HTTP sunucusu ekleyebilirsiniz
const express = require('express');
const app = express();
const port = 5003;

// Sunucu başlatma
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor!`);
});