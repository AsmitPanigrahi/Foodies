const Order = require('../models/order.model');
const Restaurant = require('../models/restaurant.model');
const MenuItem = require('../models/menuItem.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createOrder = catchAsync(async (req, res, next) => {
    // 1. Validate restaurant
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    // 2. Validate and process menu items
    const itemPromises = req.body.items.map(async (item) => {
        const menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) {
            throw new AppError(`Menu item ${item.menuItem} not found`, 404);
        }
        if (!menuItem.isAvailable) {
            throw new AppError(`${menuItem.name} is currently unavailable`, 400);
        }
        return {
            ...item,
            price: menuItem.price
        };
    });

    const processedItems = await Promise.all(itemPromises);

    // 3. Calculate initial totals
    const subtotal = processedItems.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const deliveryFee = 5; // Fixed delivery fee
    const total = subtotal + tax + deliveryFee + (req.body.tip || 0);

    // 4. Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
            restaurantId: restaurant._id.toString(),
            userId: req.user._id.toString()
        }
    });

    // 5. Create order
    const order = await Order.create({
        user: req.user._id,
        restaurant: restaurant._id,
        items: processedItems,
        deliveryAddress: req.body.deliveryAddress,
        paymentMethod: req.body.paymentMethod,
        paymentDetails: {
            paymentIntentId: paymentIntent.id,
            amount: total,
            currency: 'usd'
        },
        subtotal,
        tax,
        deliveryFee,
        tip: req.body.tip || 0,
        total,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60000) // 45 minutes from now
    });

    // 6. Emit socket event for restaurant
    req.io.to(restaurant._id.toString()).emit('new_order', {
        orderId: order._id,
        restaurantId: restaurant._id
    });

    res.status(201).json({
        status: 'success',
        data: {
            order,
            clientSecret: paymentIntent.client_secret
        }
    });
});

exports.getOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate({
            path: 'restaurant',
            populate: {
                path: 'owner'
            }
        })
        .populate('user');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Check if user has permission to view this order
    if (
        req.user.role !== 'admin' &&
        order.user._id.toString() !== req.user._id.toString() &&
        order.restaurant.owner._id.toString() !== req.user._id.toString()
    ) {
        return next(new AppError('You do not have permission to view this order', 403));
    }

    res.status(200).json({
        status: 'success',
        data: { order }
    });
});

exports.getUserOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
        .sort('-createdAt')
        .populate('restaurant')
        .populate('items.menuItem');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
    });
});

exports.getRestaurantOrders = catchAsync(async (req, res, next) => {
    console.log('1. Looking for restaurant with owner ID:', req.user._id);
    
    // First find restaurants where the logged-in user is the owner
    const restaurants = await Restaurant.find({}).populate('owner');
    const userRestaurants = restaurants.filter(restaurant => 
        restaurant.owner._id.toString() === req.user._id.toString()
    );
    
    console.log('2. Found user restaurants:', userRestaurants);
    
    if (userRestaurants.length === 0) {
        return next(new AppError('No restaurants found for this user', 404));
    }

    // Get all restaurant IDs owned by the user
    const restaurantIds = userRestaurants.map(r => r._id);
    console.log('3. Restaurant IDs:', restaurantIds);

    // Find all orders for these restaurants
    const orders = await Order.find({ restaurant: { $in: restaurantIds } })
        .sort('-createdAt')
        .populate('user')
        .populate('items.menuItem')
        .populate('restaurant');
    
    console.log('4. Found orders:', orders);

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: { orders }
    });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Check permissions
    const restaurant = await Restaurant.findById(order.restaurant);
    if (
        req.user.role !== 'admin' &&
        restaurant.owner._id.toString() !== req.user._id.toString()
    ) {
        return next(new AppError('You do not have permission to update this order', 403));
    }

    order.status = req.body.status;
    if (req.body.status === 'delivered') {
        order.actualDeliveryTime = Date.now();
    }

    await order.save();

    // Emit socket event for status update
    req.io.to(order._id.toString()).emit('order_status_update', {
        orderId: order._id,
        status: order.status
    });

    res.status(200).json({
        status: 'success',
        data: { order }
    });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
        return next(new AppError('Cannot cancel order that is already being processed', 400));
    }

    // Check if user has permission to cancel
    if (order.user.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only cancel your own orders', 403));
    }

    // Process refund if payment was made
    if (order.paymentStatus === 'completed') {
        const refund = await stripe.refunds.create({
            payment_intent: order.paymentDetails.paymentIntentId
        });

        order.refund = {
            status: 'processed',
            amount: order.total,
            processedAt: Date.now()
        };
    }

    order.status = 'cancelled';
    await order.save();

    // Notify restaurant about cancellation
    req.io.to(order.restaurant.toString()).emit('order_cancelled', {
        orderId: order._id,
        restaurantId: order.restaurant
    });

    res.status(200).json({
        status: 'success',
        data: { order }
    });
});
