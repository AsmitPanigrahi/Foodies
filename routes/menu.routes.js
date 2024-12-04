const express = require('express');
const menuController = require('../controllers/menu.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
    .route('/')
    .get(menuController.getAllMenuItems)
    .post(
        authController.restrictTo('restaurant-owner', 'admin'),
        menuController.createMenuItem
    );

router
    .route('/:id')
    .get(menuController.getMenuItem)
    .patch(
        authController.restrictTo('restaurant-owner', 'admin'),
        menuController.updateMenuItem
    )
    .delete(
        authController.restrictTo('restaurant-owner', 'admin'),
        menuController.deleteMenuItem
    );

router.get('/popular/items', menuController.getPopularItems);

module.exports = router;
