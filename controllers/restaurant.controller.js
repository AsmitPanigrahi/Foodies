const Restaurant = require('../models/restaurant.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createRestaurant = catchAsync(async (req, res, next) => {
    // Only restaurant owners can create restaurants
    if (req.user.role !== 'restaurant-owner') {
        return next(new AppError('Only restaurant owners can create restaurants', 403));
    }

    const restaurant = await Restaurant.create({
        ...req.body,
        owner: req.user._id
    });

    res.status(201).json({
        status: 'success',
        data: { restaurant }
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
        .populate('menuItems')
        .populate('reviews');

    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { restaurant }
    });
});

exports.updateRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
    }

    // Check if user is the owner or admin
    if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
    ) {
        return next(new AppError('You can only update your own restaurant', 403));
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: { restaurant: updatedRestaurant }
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
