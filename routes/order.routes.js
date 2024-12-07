const express = require('express');
const orderController = require('../controllers/order.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Place specific routes before parameterized routes
router.get('/restaurant/orders',
    authController.restrictTo('restaurant-owner', 'admin'),
    orderController.getRestaurantOrders
);

router.get('/user/orders', orderController.getUserOrders);

router.route('/')
    .post(orderController.createOrder);

router.route('/:id')
    .get(orderController.getOrder)
    .patch(
        authController.restrictTo('restaurant-owner', 'admin'),
        orderController.updateOrderStatus
    );

router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
