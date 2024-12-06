const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication token is required'
      });
    }

    // For development, accept any token and set a mock user
    req.user = {
      id: '123',
      restaurantId: req.params.restaurantId || '674ff64a4839a88e28e74d78', // Use the restaurant ID from params or default
      role: 'owner'
    };
    
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'fail',
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticateToken
};
