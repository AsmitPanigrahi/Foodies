const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Authentication routes
router.post('/signup', authController.signup);
router.post('/register', authController.signup);  
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protected routes
router.use(authController.protect); // Middleware to protect routes below this line

// Protected route example
router.get('/me', async (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
});

module.exports = router;
