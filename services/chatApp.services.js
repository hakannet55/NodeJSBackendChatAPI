// routes.js
const bcrypt = require('bcryptjs'); // Şifreyi hash'lemek için bcrypt
const jwt = require('jsonwebtoken'); // JWT için
const auth = require('../jwt_token');
const tool = require("../db");
const {getData} = require("../db");
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
    await tool.setData(tabNameEnums.tbl_users,{username, password:hashedPassword});
    res.status(201).json({ error: "" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcı kaydederken bir hata oluştu.' });
  }
};

// Kullanıcı girişi API'si
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Kullanıcıyı veritabanından al
  let result = await db.query('SELECT * FROM '+tabNameEnums.tbl_users+' WHERE username = $1', [username]);
  if (!result || result.rowCount === 0) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }
  const user = result.rows[0];

  // Şifreyi kontrol et
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }

  // JWT token oluştur
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ message: 'Giriş başarılı', token });
};

// Mesaj gönderme API'si
exports.sendMessage = async (req, res) => {
  const { userId, message } = req.body;
  // get uid from token
  const senderId=auth.currentUserId(req);
  // Mesajı veritabanına kaydet
  try {
    let result=await tool.setData(tabNameEnums.tbl_messages,{senderId,message,targetId:userId});
    if(!result || result.rowCount === 0) {
      res.status(500).json({error: 'Mesaj gonderme sırasında bir hata oluştu.'});
      return;
    }
    res.status(201).json({ error: '' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mesaj gonderme sırasında bir hata oluştu.' });
  }
};

// userId ile mesajları getirme API'si
exports.getMessages = async (req, res) => {
  const userId = req.params.userId;
  const senderId=auth.currentUserId(req);
  console.log("senderId",senderId,"userId",userId);
  // Mesajları veritabanından al
  try {
    const dbResUsers=await tool.getData(tabNameEnums.tbl_users);
    const dbRes = await tool.getData(tabNameEnums.tbl_messages, true,{targetId:+userId,senderId:+senderId},{targetId:+senderId,senderId:+userId});
    if(!dbRes || !dbResUsers) {
      res.status(500).json({error: 'Mesajları getirme sırasında bir hata oluştu.'});
      return;
    }
    let messages=dbRes.rows;
    const targetUserData=dbResUsers.rows.reduce((acc, user) => ({['_'+user.id]: user, ...acc}), {});
    console.log(targetUserData);
    if(targetUserData){
      messages=messages.map((line1) => {
        const find=targetUserData['_'+line1.targetId];
        if(!find) return line1;
        return {...line1, targetName:targetUserData[line1.targetId].username};
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
    const users = await getData(tabNameEnums.tbl_users);
    res.status(200).json(users.rows.map(user => ({username:user.username,id:user.id})) );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kullanıcıları getirme sırasında bir hata oluştu.' });
  }
};