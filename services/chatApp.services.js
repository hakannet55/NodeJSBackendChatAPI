// routes.js
const bcrypt = require('bcryptjs'); // Şifreyi hash'lemek için bcrypt
const jwt = require('jsonwebtoken'); // JWT için
const auth = require('../jwt_token');
const tool = require("../db");
const db=tool.db;
const tabNameEnums=tool.tabNameEnums;
const JWT_SECRET = auth.JWT_SECRET; // JWT secret key

// Kullanıcı kaydı API'si
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Şifreyi hash'le
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Kullanıcıyı veritabanına kaydet
  try {
    await db.query('INSERT INTO '+tabNameEnums.tbl_users+' (username, password) VALUES (?, ?)', [username, hashedPassword]);
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
  const user = await db.query('SELECT * FROM '+tabNameEnums.tbl_users+' WHERE username = ?', [username]);

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

// Mesaj gönderme API'si
exports.sendMessage = async (req, res) => {
  const { userId, message } = req.body;
  // get uid from token
  const senderId=auth.currentUserId(req);
  // Mesajı veritabanına kaydet
  try {
    await db.query('INSERT INTO '+tabNameEnums.tbl_messages+' (userId, message,senderId) VALUES (?, ?,?)', [userId, message,senderId]);
    res.status(201).json({ message: 'Mesaj basarıyla gonderildi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mesaj gonderme sırasında bir hata oluştu.' });
  }
};

// userId ile mesajları getirme API'si
exports.getMessages = async (req, res) => {
  const userId = req.params.userId;
  const senderId=auth.currentUserId(req);
  // Mesajları veritabanından al
  try {
    const targetUserData=await db.query('SELECT * FROM '+tabNameEnums.tbl_users+' WHERE id = ?', [userId]);
    const messages = await db.query('SELECT * FROM '+tabNameEnums.tbl_messages+' WHERE userId = ? AND senderId = ?', [userId,senderId]);
    if(targetUserData){
    messages.forEach((message) => {
      if(message.senderId==senderId){
        message['targetName']=targetUserData[0].username;
      }
    })
    }
    res.status(200).json( messages );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mesajları getirme sırasında bir hata oluştu.' });
  }
};
// tokenValidity
exports.tokenValidity = async (req, res) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.send('1');
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Token gecerli degil' });
  }
};

// getUsers
exports.getUsers = async (req, res) => {
  // Kullanıcıları veritabanından al
  try {
    const users = await db.query('SELECT * FROM '+tabNameEnums.tbl_users);
    res.status(200).json(users.map(user => ({username:user.username,id:user.id})) );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcıları getirme sırasında bir hata oluştu.' });
  }
};