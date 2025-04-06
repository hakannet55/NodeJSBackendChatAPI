// server.js
//authenticateToken = require('./jwt_token');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // CORS modülünü içe aktar
const db = require('./db');
const chatApp = require('./services/chatApp.services'); // API yollarını içe aktar
const prodCatalApp = require('./services/prodCatalApp.services');

require('dotenv').config(); // .env dosyasını yükle

// Express uygulaması oluştur
const app = express();

// JSON body parser
app.use(bodyParser.json());
// CORS'u her türlü istek için aktif hale getirelim
app.use(cors());


// API rotalarını tanımla
// authenticateToken ?? kontrolü de eklencek
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//app.get('/rooms', routes.getRooms,authenticateToken);

app.post('/register', chatApp.register);
app.post('/login', chatApp.login);
app.post('/sendmessages/:userId',chatApp.sendMessage);
app.post('/messages/:userId',chatApp.getMessages);
app.post('/users',chatApp.getUsers);
app.post('/tokenValidity',chatApp.tokenValidity);
//app.get('/api/rooms/:roomId', chatApp.getRoomById);
//app.get('/api/rooms/:roomId/users', chatApp.getRoomUsers);
//app.get('/api/rooms/:roomId/messages', chatApp.getRoomMessages);
const prefix=db.prefix;
app.get('/'+prefix+'/getAllProducts', prodCatalApp.getAllProducts);
app.get('/'+prefix+'/stores', prodCatalApp.getStores);
app.post('/'+prefix+'/crud', prodCatalApp.crud);
app.post('/'+prefix+'/login', prodCatalApp.login);
//app.get('/prodductsApp/removeProduct', prodCatalApp.getAllProducts);
//app.get('/prodductsApp/updateProduct', prodCatalApp.getAllProducts);

// Sunucuyu 3000 portunda dinlemeye başla
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor');
});
