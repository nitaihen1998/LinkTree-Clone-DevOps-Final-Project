const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  // Handle "Bearer token" format
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyToken };