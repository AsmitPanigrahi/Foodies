const express = require('express');
const authController = require('../controllers/auth.controller');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// Create payment intent
router.post('/create-payment-intent', catchAsync(async (req, res, next) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total * 100),
        currency: 'usd',
        metadata: {
            orderId: order._id.toString(),
            userId: req.user._id.toString()
        }
    });

    res.status(200).json({
        status: 'success',
        clientSecret: paymentIntent.client_secret
    });
}));

// Webhook handler for Stripe events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const order = await Order.findById(paymentIntent.metadata.orderId);
            if (order) {
                order.paymentStatus = 'completed';
                order.paymentDetails = {
                    transactionId: paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                    paymentTime: new Date()
                };
                await order.save();
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            const failedOrder = await Order.findById(failedPayment.metadata.orderId);
            if (failedOrder) {
                failedOrder.paymentStatus = 'failed';
                await failedOrder.save();
            }
            break;
    }

    res.json({ received: true });
});

// Get payment methods for user
router.get('/payment-methods', catchAsync(async (req, res, next) => {
    const paymentMethods = await stripe.paymentMethods.list({
        customer: req.user.stripeCustomerId,
        type: 'card'
    });

    res.status(200).json({
        status: 'success',
        data: paymentMethods.data
    });
}));

// Add new payment method
router.post('/payment-methods', catchAsync(async (req, res, next) => {
    const { paymentMethodId } = req.body;

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
        customer: req.user.stripeCustomerId,
    });

    res.status(200).json({
        status: 'success',
        message: 'Payment method added successfully'
    });
}));

module.exports = router;
