const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'An order must belong to a user']
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: 'Restaurant',
        required: [true, 'An order must belong to a restaurant']
    },
    items: [{
        menuItem: {
            type: mongoose.Schema.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        customizations: [{
            name: String,
            option: {
                name: String,
                price: Number
            }
        }],
        specialInstructions: String
    }],
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'preparing',
            'ready_for_pickup',
            'out_for_delivery',
            'delivered',
            'cancelled'
        ],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        required: true
    },
    paymentDetails: {
        transactionId: String,
        paymentIntentId: String,
        amount: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        paymentTime: Date
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    tip: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    estimatedDeliveryTime: {
        type: Date,
        required: true
    },
    actualDeliveryTime: Date,
    deliveryPerson: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    rating: {
        food: {
            type: Number,
            min: 1,
            max: 5
        },
        delivery: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    },
    refund: {
        status: {
            type: String,
            enum: ['none', 'requested', 'approved', 'processed', 'rejected'],
            default: 'none'
        },
        reason: String,
        amount: Number,
        processedAt: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ deliveryPerson: 1, status: 1 });
orderSchema.index({ 'deliveryAddress.location': '2dsphere' });

// Populate references
orderSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name email phoneNumber'
    })
    .populate({
        path: 'restaurant',
        select: 'name address contactNumber'
    })
    .populate({
        path: 'items.menuItem',
        select: 'name price image'
    })
    .populate({
        path: 'deliveryPerson',
        select: 'name phoneNumber'
    });
    
    next();
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
    if (!this.isModified('items') && !this.isNew) return next();
    
    this.subtotal = this.items.reduce((acc, item) => {
        const itemTotal = item.price * item.quantity;
        const customizationsTotal = item.customizations.reduce((acc, curr) => 
            acc + (curr.option.price || 0), 0);
        return acc + itemTotal + customizationsTotal;
    }, 0);
    
    this.tax = this.subtotal * 0.1; // 10% tax
    this.total = this.subtotal + this.tax + this.deliveryFee + (this.tip || 0);
    
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
