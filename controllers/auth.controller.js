const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs'); // Import bcrypt

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    try {
        // 1) Check if password meets minimum length requirement
        if (!req.body.password || req.body.password.length < 8) {
            return next(new AppError('Password must be at least 8 characters long', 400));
        }

        // 2) Hash the password before creating user
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        // 3) Create new user with hashed password
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            phoneNumber: req.body.phoneNumber,
            role: req.body.role || 'user',
            address: req.body.address
        });

        // 4) Generate JWT and send response
        createSendToken(newUser, 201, res);
    } catch (error) {
        console.error('Error in signup:', error);
        if (error.code === 11000) {
            return next(new AppError('Email already exists', 400));
        }
        return next(new AppError('Error creating user: ' + error.message, 400));
    }
});

exports.login = catchAsync(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password!', 400));
        }

        // 2) Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // 3) Hash the provided password and compare with stored hash
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // 4) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        return next(new AppError('Error during login: ' + error.message, 400));
    }
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log('Checking roles:', {
            required: roles,
            userRole: req.user?.role
        });
        
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
