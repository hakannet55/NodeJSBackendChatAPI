// routes.js
const bcrypt = require('bcryptjs'); // Şifreyi hash'lemek için bcrypt
const jwt = require('jsonwebtoken'); // JWT için
const db = require('../db'); // DB işlemleri için db.js
const auth = require('../jwt_token');
const JWT_SECRET = auth.JWT_SECRET; // JWT secret key

// Kullanıcı kaydı API'si
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Şifreyi hash'le
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Kullanıcıyı veritabanına kaydet
  try {
    await db.query('INSERT INTO '+db.tabNameEnums.tbl_users+' (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcı kaydederken bir hata oluştu.' });
  }
};

// Kullanıcı girişi API'si
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Kullanıcıyı veritabanından al
  const user = await db.query('SELECT * FROM '+db.tabNameEnums.tbl_users+' WHERE username = ?', [username]);

  if (!user || user.length === 0) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }

  // Şifreyi kontrol et
  const isMatch = bcrypt.compareSync(password, user[0].password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }

  // JWT token oluştur
  const token = jwt.sign({ id: user[0].id, username: user[0].username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ message: 'Giriş başarılı', token });
};

// getAllProducts
exports.getAllProducts = async (req, res) => {
  // Urunleri veritabanından al
    const products = await db.query('SELECT * FROM '+db.tabNameEnums.tbl_products);
    if(!products || products.length === 0 ){
        return res.status(200).json(Array.from({length: 3}, () => ({
            id: 0,
            name: "Urun yok"+ Math.floor(Math.random() * 1000),
            price: Math.floor(Math.random() * 12000)+250+" TL",
            description: "Urun yok",
            image: "https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=400"
            })
            ));
    }
    res.status(200).json({ products });
};
