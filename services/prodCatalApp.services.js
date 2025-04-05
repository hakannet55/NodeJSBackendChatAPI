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

exports.getMagazalar = async (req, res) => {
    // Kullanıcıları veritabanından al
    try {
      const magazalar = await db.getData(db.tabNameEnums.tbl_magazalar);
      res.status(200).json(magazalar);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Kullanıcıları getirme sırasında bir hata oluştu.' });
    }
}

exports.crud = async (req, res) => {
if(req.body.isCrud===1){
    const { tname,operator,data,itemId} = sqlInjectFilterObject( req.body);
    // Kullanıcıyı veritabanından al
    // token control
    console.log(sqlInjectFilterObject( req.body));
    auth.authenticateToken(req, res, async () => {
        try {
        const tnameexist=await db.query('SHOW TABLES LIKE ?', [tname]);
        if(tnameexist){
               if(operator === "add"){
                   await db.query('INSERT INTO '+tname+' SET ? ', [data]);
               }else if(operator === "update"){
                   await db.query('UPDATE '+tname+' SET ? WHERE id = ?', [data,itemId]);
               }else if(operator === "delete"){
                   await db.query('DELETE FROM '+tname+' WHERE id = ?', [itemId]);
               }else{
                   throw new Error('Operator bulunamadı');
               }
               res.status(200).json({ result: 1 });
        }else{
            throw new Error('Tablo bulunamadı');
        }

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Kullanıcı kaydederken bir hata oluştu.' });
        }
    });
}


};

// getAllProducts
exports.getAllProducts = async (req, res) => {
  // Urunleri veritabanından al
    const products = await db.query('SELECT * FROM '+db.tabNameEnums.tbl_products);
    if(!products || products.length === 0 ){
        return res.status(200).json(Array.from({length: 3}, () => ({
            id: 0,
            name: "Urun yok"+ Math.floor(Math.random() * 1000),
            price: Math.floor(Math.random() * 12000)+250,
            description: "Urun yok",
            image: "https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=400"
            })
            ));
    }
    res.status(200).json({ products });
};
