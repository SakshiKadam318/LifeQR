
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is missing in environment variables');

    return res.status(500).json({
      error: 'Server authentication configuration error'
    });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No token provided. Please login again.'
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      error: 'Empty authentication token. Please login again.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        error: 'Invalid token payload. Please login again.'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);

    return res.status(401).json({
      error: 'Invalid or expired token. Please login again.'
    });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
