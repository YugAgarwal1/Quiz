import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quiz_bird_super_secure_jwt_secret_key_2026_x89f';

export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user record from database
    const user = db.get('SELECT id, name, email, role, semester_id, college FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
}

// Optional Auth: populates req.user if valid token provided, but doesn't block request
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.get('SELECT id, name, email, role, semester_id, college FROM users WHERE id = ?', [decoded.id]);
      if (user) req.user = user;
    }
  } catch (error) {
    // Ignore error for optional auth
  }
  next();
}

// Require Admin Role
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges required.'
    });
  }

  next();
}
