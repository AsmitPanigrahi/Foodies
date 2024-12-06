const express = require('express');
const restaurantController = require('../controllers/restaurant.controller');
const authController = require('../controllers/auth.controller');
const menuRoutes = require('./menu.routes');

const router = express.Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/search', restaurantController.searchRestaurants);

// Protected routes
router.use(authController.protect);

// Restaurant owner routes
router.get('/dashboard', 
    authController.restrictTo('restaurant-owner', 'admin'),
    restaurantController.getRestaurantDashboard
);

router.get('/me', restaurantController.getMyRestaurant);

// Nest menu routes
router.use('/:restaurantId/menu', menuRoutes);

// Routes with :id parameter should come last
router.get('/:id', restaurantController.getRestaurant);
router
    .route('/:id')
    .patch(
        authController.restrictTo('restaurant-owner', 'admin'),
        restaurantController.updateRestaurant
    )
    .delete(
        authController.restrictTo('restaurant-owner', 'admin'),
        restaurantController.deleteRestaurant
    );

module.exports = router;
