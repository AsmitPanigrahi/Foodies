const Restaurant = require('../models/restaurant.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createRestaurant = catchAsync(async (req, res, next) => {
    try {
        // Check if user already has a restaurant
        const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
        
        if (existingRestaurant) {
            return next(new AppError('You already have a restaurant', 400));
        }

        // Validate required fields
        const requiredFields = ['name', 'cuisine', 'contactNumber', 'email', 'preparationTime', 'deliveryRadius', 'minimumOrder'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
        }

        // Validate address
        if (!req.body.address || !req.body.address.street || !req.body.address.city || !req.body.address.state || !req.body.address.zipCode || !req.body.address.country) {
            return next(new AppError('Please provide complete address information (street, city, state, zipCode, country)', 400));
        }

        // Validate cuisine array
        if (!Array.isArray(req.body.cuisine) || req.body.cuisine.length === 0) {
            return next(new AppError('Please provide at least one cuisine type', 400));
        }

        // Convert openingHours to a JSON string if it's an object
        if (typeof req.body.openingHours === 'object') {
            req.body.openingHours = JSON.stringify(req.body.openingHours);
        }

        // Ensure features is an array
        if (req.body.features && !Array.isArray(req.body.features)) {
            req.body.features = [req.body.features];
        }

        // Transform features to match the new schema
        if (req.body.features) {
            req.body.features = req.body.features.map(feature => ({
                hasDelivery: feature.hasDelivery || false,
                hasTableBooking: feature.hasTableBooking || false,
                hasTakeaway: feature.hasTakeaway || false
            }));
        }

        // Validate features if provided
        if (req.body.features) {
            const validFeatures = ['hasDelivery', 'hasTableBooking', 'hasTakeaway'];
            const invalidFeatures = req.body.features.filter(feature => !validFeatures.includes(Object.keys(feature)[0]));
            
            if (invalidFeatures.length > 0) {
                return next(new AppError(`Invalid features: ${invalidFeatures.join(', ')}`, 400));
            }
        }

        // Create the restaurant with owner field
        const restaurant = await Restaurant.create({
            ...req.body,
            owner: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: { restaurant }
        });
    } catch (error) {
        console.error('Restaurant creation error:', error);
        return next(new AppError(error.message || 'Error creating restaurant', 500));
    }
});

exports.getMyRestaurant = catchAsync(async (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        return next(new AppError('You are not logged in', 401));
    }

    // Check if user is a restaurant owner or admin
    if (req.user.role !== 'restaurant-owner' && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to access this resource', 403));
    }

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
        return next(new AppError('You haven\'t created a restaurant profile yet', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            restaurant
        }
    });
});

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
    const { cuisine, priceRange, rating, location } = req.query;
    const filter = {};

    // Apply filters
    if (cuisine) filter.cuisine = cuisine;
    if (priceRange) filter.priceRange = priceRange;
    if (rating) filter.rating = { $gte: parseFloat(rating) };

    // Geospatial query if location is provided
    if (location) {
        const [lng, lat] = location.split(',').map(coord => parseFloat(coord));
        filter.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                $maxDistance: 10000 // 10km
            }
        };
    }

    const restaurants = await Restaurant.find(filter);

    res.status(200).json({
        status: 'success',
        results: restaurants.length,
        data: { restaurants }
    });
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id)
        .populate('menuItems');

    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { restaurant }
    });
});

exports.updateRestaurant = catchAsync(async (req, res, next) => {
    // Convert openingHours to a JSON string if it's an object
    if (typeof req.body.openingHours === 'object') {
        req.body.openingHours = JSON.stringify(req.body.openingHours);
    }

    // Ensure features is an array
    if (req.body.features && !Array.isArray(req.body.features)) {
        req.body.features = [req.body.features];
    }

    // Transform features to match the new schema
    if (req.body.features) {
        req.body.features = req.body.features.map(feature => ({
            hasDelivery: feature.hasDelivery || false,
            hasTableBooking: feature.hasTableBooking || false,
            hasTakeaway: feature.hasTakeaway || false
        }));
    }

    // Validate features if provided
    if (req.body.features) {
        const validFeatures = ['hasDelivery', 'hasTableBooking', 'hasTakeaway'];
        const invalidFeatures = req.body.features.filter(feature => !validFeatures.includes(Object.keys(feature)[0]));
        
        if (invalidFeatures.length > 0) {
            return next(new AppError(`Invalid features: ${invalidFeatures.join(', ')}`, 400));
        }
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { restaurant }
    });
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
    }

    // Check if user is the owner or admin
    if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
    ) {
        return next(new AppError('You can only delete your own restaurant', 403));
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getRestaurantsByDistance = catchAsync(async (req, res, next) => {
    const { lat, lng, distance } = req.params;
    const radius = distance / 6378.1; // Convert distance to radians

    const restaurants = await Restaurant.find({
        location: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
    });

    res.status(200).json({
        status: 'success',
        results: restaurants.length,
        data: { restaurants }
    });
});

exports.getRestaurantDashboard = catchAsync(async (req, res, next) => {
    // Get the restaurant owned by the current user
    const restaurant = await Restaurant.findOne({ owner: req.user._id })
        .populate('menuItems');

    if (!restaurant) {
        return next(new AppError('You haven\'t created a restaurant profile yet', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            restaurant
        }
    });
});

exports.searchRestaurants = catchAsync(async (req, res, next) => {
    const { query, cuisine, priceRange, rating } = req.query;
    const searchQuery = {};

    // Text search if query is provided
    if (query) {
        searchQuery.$or = [
            { name: { $regex: query, $options: 'i' } },
            { 'cuisine': { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    // Apply filters
    if (cuisine) {
        searchQuery.cuisine = { $in: Array.isArray(cuisine) ? cuisine : [cuisine] };
    }
    if (priceRange) {
        searchQuery.priceRange = priceRange;
    }
    if (rating) {
        searchQuery.rating = { $gte: parseFloat(rating) };
    }

    const restaurants = await Restaurant.find(searchQuery)
        .select('name cuisine image rating priceRange address');

    res.status(200).json({
        status: 'success',
        results: restaurants.length,
        data: { restaurants }
    });
});
