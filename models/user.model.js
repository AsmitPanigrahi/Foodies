const mongoose = require('mongoose');
const validator = require('validator');

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
        enum: ['user', 'restaurant-owner'],
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
}, {
    timestamps: true
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });


const User = mongoose.model('User', userSchema);
module.exports = User;
