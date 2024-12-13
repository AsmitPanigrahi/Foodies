const Order = require('../models/order.model');
const Restaurant = require('../models/restaurant.model');
const MenuItem = require('../models/menuItem.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createOrder = catchAsync(async (req, res, next) => {
    try {
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
                menuItem: item.menuItem,
                quantity: item.quantity,
                price: menuItem.price,
                specialInstructions: item.specialInstructions
            };
        });

        const processedItems = await Promise.all(itemPromises);

        // 3. Calculate initial totals
        const subtotal = processedItems.reduce((acc, item) => {
            return acc + (item.price * item.quantity);
        }, 0);

        const tax = subtotal * 0.1; // 10% tax
        const deliveryFee = 5; // Fixed delivery fee
        const total = subtotal + tax + deliveryFee;

        // 4. Calculate estimated delivery time (45 minutes from now)
        const estimatedDeliveryTime = new Date(Date.now() + 45 * 60000); // 45 minutes in milliseconds

        // 5. Create the order
        const orderData = {
            user: req.user._id,
            restaurant: restaurant._id,
            items: processedItems,
            status: 'pending',
            subtotal,
            tax,
            deliveryFee,
            total,
            deliveryAddress: req.body.deliveryAddress,
            paymentMethod: req.body.paymentMethod,
            paymentStatus: 'pending',
            estimatedDeliveryTime,
            orderDate: new Date()
        };

        const order = await Order.create(orderData);

        // 6. Notify restaurant if socket is available
        if (req.io) {
            try {
                req.io.to(`restaurant_${restaurant._id}`).emit('new_order', {
                    orderId: order._id,
                    status: order.status
                });
            } catch (socketError) {
                console.error('Socket notification failed:', socketError);
                // Don't throw error, just log it
            }
        }

        res.status(201).json({
            status: 'success',
            data: {
                order,
                message: 'Order created successfully'
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return next(new AppError(error.message || 'Error creating order', error.statusCode || 500));
    }
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
    try {
        // Verify user exists and has required role
        if (!req.user) {
            return next(new AppError('User not found', 401));
        }

        if (!['restaurant-owner', 'admin'].includes(req.user.role)) {
            return next(new AppError('You do not have permission to access this resource', 403));
        }

        // Find the restaurant
        const restaurant = await Restaurant.findOne({ owner: req.user._id });
        
        if (!restaurant) {
            return next(new AppError('No restaurant found for this user', 404));
        }

        // Find orders
        const orders = await Order.find({ restaurant: restaurant._id })
            .sort('-createdAt')
            .populate({
                path: 'user',
                select: 'name email phoneNumber'
            })
            .populate({
                path: 'items.menuItem',
                select: 'name price image'
            })
            .populate({
                path: 'restaurant',
                select: 'name address contactNumber'
            });

        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: { orders }
        });
    } catch (error) {
        console.error('Error in getRestaurantOrders:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            user: req.user?._id,
            role: req.user?.role
        });
        return next(new AppError(`Error fetching restaurant orders: ${error.message}`, 500));
    }
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    try {
        // Find order and populate restaurant details, but not user
        const order = await Order.findById(req.params.id)
            .select('user status paymentDetails restaurant actualDeliveryTime')
            .populate({
                path: 'restaurant',
                populate: {
                    path: 'owner',
                    select: '_id'
                }
            });

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        // Check if this is the user's order (comparing ObjectIds)
        const isCustomer = order.user.equals(req.user._id);
        const isAdmin = req.user.role === 'admin';
        const isOwner = order.restaurant?.owner?._id && req.user._id.equals(order.restaurant.owner._id);

        if (!isAdmin && !isOwner && !isCustomer) {
            return next(new AppError('You do not have permission to update this order', 403));
        }

        // Validate status if it's being updated
        if (req.body.status) {
            const validStatuses = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered', 'cancelled'];
            if (!validStatuses.includes(req.body.status)) {
                return next(new AppError(`Invalid status value: ${req.body.status}. Valid values are: ${validStatuses.join(', ')}`, 400));
            }
            order.status = req.body.status;
        }

        // Update payment info if provided
        if (req.body.paymentId) {
            order.paymentDetails = {
                ...order.paymentDetails,
                paymentId: req.body.paymentId,
                status: 'completed',
                updatedAt: new Date()
            };
        }

        // Update delivery time if order is delivered
        if (req.body.status === 'delivered') {
            order.actualDeliveryTime = Date.now();
        }

        const savedOrder = await order.save();

        // Emit socket event for status update
        if (req.io) {
            req.io.to(order._id.toString()).emit('order_status_update', {
                orderId: order._id,
                status: order.status
            });
        }

        res.status(200).json({
            status: 'success',
            data: { order: savedOrder }
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        return next(new AppError(`Error updating order status: ${error.message}`, 500));
    }
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
