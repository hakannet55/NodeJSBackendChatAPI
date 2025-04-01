// routes.js
const bcrypt = require('bcryptjs'); // Şifreyi hash'lemek için bcrypt
const jwt = require('jsonwebtoken'); // JWT için
const db = require('../db'); // DB işlemleri için db.js

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey'; // JWT secret key

// Kullanıcı kaydı API'si
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Şifreyi hash'le
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Kullanıcıyı veritabanına kaydet
  try {
    await db.query('INSERT INTO tbl_users (username, password) VALUES (?, ?)', [username, hashedPassword]);
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
  const user = await db.query('SELECT * FROM tbl_users WHERE username = ?', [username]);

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

  // Mesajı veritabanına kaydet
  try {
    const result = await db.query('INSERT INTO tbl_messages (user_id, message) VALUES (?, ?)', [userId, message]);
    res.status(201).json({ message: 'Mesaj gönderildi', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mesaj gönderme sırasında bir hata oluştu.' });
  }
};

// userId ile mesajları getirme API'si
exports.getMessages = async (req, res) => {
  const userId = req.params.userId;

  // Mesajları veritabanından al
  try {
    const messages = await db.query('SELECT * FROM tbl_messages WHERE user_id = ?', [userId]);
    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mesajları getirme sırasında bir hata oluştu.' });
  }
};

// getUsers
exports.getUsers = async (req, res) => {
  // Kullanıcıları veritabanından al
  try {
    const users = await db.query('SELECT * FROM tbl_users');
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcıları getirme sırasında bir hata oluştu.' });
  }
};