// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const auth = req.headers.authorization?.split(' ');
  if (auth?.[0] !== 'Bearer' || !auth[1])
    return res.status(401).json({ error: 'Token manquant' });

  try {
    req.user = jwt.verify(auth[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
};
