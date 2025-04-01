// jwt_token.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET|| "your_very_secure_jwt_secret";

// Middleware to authenticate and extract the user ID from the JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'Malformed token' });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId; 
    next();
  });
};

const currentUserName=(req)=>{
  const token = req.headers.authorization;
  try {
    const obj=jwt.decode(token);
    if(!obj){
      return null;
    }
    return obj.username;
  } catch (err) {
    console.error(err);
    return null;
    }
};

const currentUserId=(req)=>{
  const token = req.headers.authorization;
  try {
    const obj=jwt.decode(token);
    if(!obj){
      return null;
    }
    return obj.id;
  } catch (err) {
    console.error(err);
    return null;
    }
};

// Export the authenticateToken middleware
module.exports = { authenticateToken,currentUserName,currentUserId,JWT_SECRET };
