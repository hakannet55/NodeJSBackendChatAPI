const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Bellek içi veritabanları (In-memory)
let users = [];
let groups = [];
let messages = [];
let currentUserId = 1;
let currentGroupId = 1;

// Middleware
app.use(bodyParser.json());

// Register API: Kullanıcı kaydı
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Kullanıcı adı kontrolü
    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
    }

    // Aynı kullanıcı adıyla kayıtlı başka bir kullanıcı olup olmadığını kontrol et
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış' });
    }

    const newUser = {
        id: currentUserId++,
        username,
        password, // Şifre burada düz metinle saklanıyor, gerçek dünyada hashlenmelidir
    };

    users.push(newUser);
    return res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi', user: newUser });
});

// Login API: Kullanıcı girişi
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // Kullanıcı giriş yaptı
    return res.status(200).json({ message: 'Giriş başarılı', userId: user.id });
});

// Logout API: Kullanıcı çıkışı (basitçe mesaj)
app.post('/logout', (req, res) => {
    return res.status(200).json({ message: 'Çıkış yapıldı' });
});

// Chat API: Sohbet mesajı gönderme
app.post('/chat', (req, res) => {
    const { userId, message } = req.body;

    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const newMessage = {
        id: messages.length + 1,
        userId,
        username: user.username,
        message,
        timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    return res.status(201).json({ message: 'Mesaj gönderildi', data: newMessage });
});

// Group API: Grup oluşturma
app.post('/group', (req, res) => {
    const { groupName, userId } = req.body;

    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const newGroup = {
        id: currentGroupId++,
        groupName,
        createdBy: user.id,
        members: [user.id], // Grup oluşturucusu ilk üye olarak ekleniyor
    };

    groups.push(newGroup);
    return res.status(201).json({ message: 'Grup oluşturuldu', group: newGroup });
});

// Group Chat API: Grup sohbeti (mesaj gönderme)
app.post('/group/chat', (req, res) => {
    const { groupId, userId, message } = req.body;

    const group = groups.find(group => group.id === groupId);
    const user = users.find(user => user.id === userId);

    if (!group) {
        return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    if (!user || !group.members.includes(user.id)) {
        return res.status(403).json({ error: 'Bu gruba üye değilsiniz' });
    }

    const newGroupMessage = {
        id: messages.length + 1,
        groupId,
        userId,
        username: user.username,
        message,
        timestamp: new Date().toISOString(),
    };

    messages.push(newGroupMessage);
    return res.status(201).json({ message: 'Grup mesajı gönderildi', data: newGroupMessage });
});

// API'leri başlatma
app.listen(port, () => {
    console.log(`Server ${port} portunda çalışıyor`);
});
