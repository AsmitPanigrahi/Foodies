const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'restaurant-owner', 'admin'],
        default: 'user'
    },
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
            default: [0, 0]
        }
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide your phone number']
    },
    profileImage: {
        type: String,
        default: 'default.jpg'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date
}, {
    timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Only find active users
userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

// Instance methods
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
