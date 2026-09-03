// ===================== OneP MFS - JWT Authentication Middleware =====================

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Authorization header থেকে token পাওয়া
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_004',
        message: 'Token পাওয়া যায়নি'
      });
    }

    // Bearer token extract করা
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Token verify করা
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'AUTH_004',
        message: 'Token মেয়াদ শেষ'
      });
    }
    
    return res.status(401).json({
      success: false,
      code: 'AUTH_004',
      message: 'অবৈধ Token'
    });
  }
};

module.exports = { authMiddleware };
