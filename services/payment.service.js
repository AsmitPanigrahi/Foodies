const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createPaymentIntent = catchAsync(async (orderId) => {
    const order = await Order.findById(orderId);
    
    if (!order) {
        throw new AppError('Order not found', 404);
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total * 100), // Convert to cents
        currency: 'usd',
        metadata: {
            orderId: order._id.toString(),
            restaurantId: order.restaurant.toString(),
            userId: order.user.toString()
        }
    });

    return paymentIntent;
});

exports.confirmPayment = catchAsync(async (paymentIntentId) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
        const order = await Order.findById(paymentIntent.metadata.orderId);
        
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        order.paymentStatus = 'completed';
        order.paymentDetails = {
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            paymentTime: new Date()
        };

        await order.save();

        return order;
    }

    throw new AppError('Payment not successful', 400);
});

exports.processRefund = catchAsync(async (orderId) => {
    const order = await Order.findById(orderId);
    
    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus !== 'completed') {
        throw new AppError('Cannot refund an unpaid order', 400);
    }

    const refund = await stripe.refunds.create({
        payment_intent: order.paymentDetails.transactionId,
        amount: Math.round(order.total * 100) // Convert to cents
    });

    order.refund = {
        status: 'processed',
        amount: refund.amount / 100,
        processedAt: new Date()
    };

    await order.save();

    return order;
});

exports.createCustomer = catchAsync(async (user) => {
    const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
            userId: user._id.toString()
        }
    });

    return customer;
});

exports.addPaymentMethod = catchAsync(async (customerId, paymentMethodId) => {
    await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
    });

    const updatedCustomer = await stripe.customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    });

    return updatedCustomer;
});
