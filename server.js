// server.js
//authenticateToken = require('./jwt_token');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // CORS modülünü içe aktar

const routes = require('./routes'); // API yollarını içe aktar
const routersCatalogApp = require('./prodCatalAppRoutes');

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
// authenticateToken ?? kontrolü de eklencek
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//app.get('/rooms', routes.getRooms,authenticateToken);

app.post('/messages/:userId',routes.getMessages);
app.post('/users',routes.getUsers);

//app.get('/api/rooms/:roomId', routes.getRoomById);
//app.get('/api/rooms/:roomId/users', routes.getRoomUsers);
//app.get('/api/rooms/:roomId/messages', routes.getRoomMessages);


app.get('prodductsApp/getAllProducts', routersCatalogApp.getAllProducts);
//app.get('prodductsApp/addProduct', routes.getAllProducts);
//app.get('prodductsApp/removeProduct', routes.getAllProducts);
//app.get('prodductsApp/updateProduct', routes.getAllProducts);

// Sunucuyu 3000 portunda dinlemeye başla
app.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor');
});
