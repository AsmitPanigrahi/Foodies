const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A restaurant must have a name'],
        trim: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A restaurant must have an owner']
    },
    description: {
        type: String,
        trim: true
    },
    cuisine: [{
        type: String,
        required: [true, 'A restaurant must have at least one cuisine type']
    }],
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'A restaurant must have coordinates']
        }
    },
    image: {
        type: String,
        default: 'default-restaurant.jpg'
    },
    rating: {
        type: Number,
        default: 4.0,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    priceRange: {
        type: String,
        enum: ['$', '$$', '$$$', '$$$$'],
        default: '$$'
    },
    contactNumber: {
        type: String,
        required: [true, 'A restaurant must have a contact number']
    },
    email: {
        type: String,
        required: [true, 'A restaurant must have an email'],
        lowercase: true,
        validate: {
            validator: function(v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    openingHours: {
        type: mongoose.Schema.Types.Mixed, // Allow any type of data
        required: [true, 'A restaurant must have opening hours']
    },
    preparationTime: {
        type: Number,
        required: [true, 'A restaurant must have an average preparation time'],
        min: [5, 'Preparation time must be at least 5 minutes']
    },
    deliveryRadius: {
        type: Number,
        required: [true, 'A restaurant must specify its delivery radius'],
        min: [0, 'Delivery radius cannot be negative']
    },
    minimumOrder: {
        type: Number,
        required: [true, 'A restaurant must specify its minimum order amount'],
        min: [0, 'Minimum order cannot be negative']
    },
    features: {
        type: [{
            hasDelivery: Boolean,
            hasTableBooking: Boolean,
            hasTakeaway: Boolean
        }],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create indexes
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ cuisine: 1 });

// Virtual populate menu items
restaurantSchema.virtual('menuItems', {
    ref: 'MenuItem',
    foreignField: 'restaurant',
    localField: '_id'
});

// Middleware to populate owner details
restaurantSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'owner',
        select: 'name email phoneNumber'
    });
    next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
