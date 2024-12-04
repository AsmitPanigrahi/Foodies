const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A menu item must have a name'],
        trim: true
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: [true, 'A menu item must belong to a restaurant']
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'A menu item must have a price']
    },
    category: {
        type: String,
        required: [true, 'A menu item must have a category'],
        enum: ['appetizer', 'main course', 'dessert', 'beverage', 'sides']
    },
    image: {
        type: String,
        default: 'default-food.jpg'
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isGlutenFree: {
        type: Boolean,
        default: false
    },
    spicyLevel: {
        type: Number,
        min: 0,
        max: 3,
        default: 0
    },
    ingredients: [{
        type: String
    }],
    allergens: [{
        type: String
    }],
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbohydrates: Number,
        fats: Number,
        fiber: Number
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        required: [true, 'Please provide preparation time in minutes']
    },
    customization: [{
        name: String,
        options: [{
            name: String,
            price: Number
        }]
    }],
    ratings: {
        average: {
            type: Number,
            default: 4.0,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0']
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    isSpecial: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
menuItemSchema.index({ restaurant: 1, name: 1 });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ price: 1 });

// Virtual populate for reviews
menuItemSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'menuItem',
    localField: '_id'
});

// Middleware to populate restaurant details
menuItemSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'restaurant',
        select: 'name location'
    });
    next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
