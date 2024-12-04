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
    images: [String],
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
        required: [true, 'A restaurant must have a price range']
    },
    openingHours: {
        monday: {
            open: String,
            close: String,
            closed: Boolean
        },
        tuesday: {
            open: String,
            close: String,
            closed: Boolean
        },
        wednesday: {
            open: String,
            close: String,
            closed: Boolean
        },
        thursday: {
            open: String,
            close: String,
            closed: Boolean
        },
        friday: {
            open: String,
            close: String,
            closed: Boolean
        },
        saturday: {
            open: String,
            close: String,
            closed: Boolean
        },
        sunday: {
            open: String,
            close: String,
            closed: Boolean
        }
    },
    contactNumber: {
        type: String,
        required: [true, 'A restaurant must have a contact number']
    },
    email: {
        type: String,
        required: [true, 'A restaurant must have an email'],
        lowercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        required: [true, 'Please provide average preparation time in minutes']
    },
    deliveryRadius: {
        type: Number,
        required: [true, 'Please provide delivery radius in kilometers']
    },
    minimumOrder: {
        type: Number,
        required: [true, 'Please provide minimum order amount']
    },
    features: {
        hasDelivery: {
            type: Boolean,
            default: true
        },
        hasTableBooking: {
            type: Boolean,
            default: false
        },
        hasTakeaway: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ cuisine: 1 });

// Virtual populate for menu items
restaurantSchema.virtual('menuItems', {
    ref: 'MenuItem',
    foreignField: 'restaurant',
    localField: '_id'
});

// Virtual populate for reviews
restaurantSchema.virtual('reviews', {
    ref: 'Review',
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
