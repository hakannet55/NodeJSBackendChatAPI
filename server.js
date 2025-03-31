// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // CORS modülünü içe aktar

const routes = require('./routes'); // API yollarını içe aktar
require('dotenv').config(); // .env dosyasını yükle

// Express uygulaması oluştur
const app = express();

// JSON body parser
app.use(bodyParser.json());
// CORS'u her türlü istek için aktif hale getirelim
app.use(cors());

// API rotaları
app.post('/register', routes.register);
app.post('/login', routes.login);
app.post('/message', routes.sendMessage);

// Sunucuyu 3000 portunda dinlemeye başla
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor');
});
