// server.js
//authenticateToken = require('./jwt_token');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // CORS modülünü içe aktar

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


app.get('/prodductsApp/getAllProducts', prodCatalApp.getAllProducts);
app.get('/prodductsApp/getMagazalar', prodCatalApp.getMagazalar);
app.post('/prodductsApp/crud', prodCatalApp.crud);
//app.get('/prodductsApp/addProduct', prodCatalApp.getAllProducts);
//app.get('/prodductsApp/removeProduct', prodCatalApp.getAllProducts);
//app.get('/prodductsApp/updateProduct', prodCatalApp.getAllProducts);

// Sunucuyu 3000 portunda dinlemeye başla
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor');
});
