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
router.post('/create-intent', catchAsync(async (req, res, next) => {
    const { amount, orderId } = req.body;

    if (!amount) {
        return next(new AppError('Amount is required', 400));
    }

    if (!orderId) {
        return next(new AppError('Order ID is required', 400));
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
        return next(new AppError('Order not found or unauthorized', 404));
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // amount in cents
        currency: 'usd',
        metadata: {
            orderId: orderId,
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
            // Update order status
            if (paymentIntent.metadata.orderId) {
                await Order.findByIdAndUpdate(
                    paymentIntent.metadata.orderId,
                    { 
                        paymentStatus: 'paid',
                        status: 'confirmed'
                    }
                );
            }
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            // Update order status
            if (failedPayment.metadata.orderId) {
                await Order.findByIdAndUpdate(
                    failedPayment.metadata.orderId,
                    { 
                        paymentStatus: 'failed',
                        status: 'cancelled'
                    }
                );
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

module.exports = router;
