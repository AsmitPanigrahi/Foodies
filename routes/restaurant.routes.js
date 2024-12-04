const express = require('express');
const restaurantController = require('../controllers/restaurant.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
    .route('/')
    .get(restaurantController.getAllRestaurants)
    .post(
        authController.restrictTo('restaurant-owner', 'admin'),
        restaurantController.createRestaurant
    );

router
    .route('/:id')
    .get(restaurantController.getRestaurant)
    .patch(
        authController.restrictTo('restaurant-owner', 'admin'),
        restaurantController.updateRestaurant
    )
    .delete(
        authController.restrictTo('restaurant-owner', 'admin'),
        restaurantController.deleteRestaurant
    );

router.get(
    '/distance/:lat/:lng/:distance',
    restaurantController.getRestaurantsByDistance
);

module.exports = router;
