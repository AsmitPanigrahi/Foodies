module.exports = {
    // Server configuration
    port: process.env.PORT || 5000,
    
    // Database configuration
    mongoURI: process.env.MONGODB_URI,
    
    // JWT configuration
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '7d',
    
    // Cors configuration
    corsOptions: {
        origin: process.env.FRONTEND_URL || 'https://your-production-domain.com',
        credentials: true
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // Stripe configuration
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET
};
