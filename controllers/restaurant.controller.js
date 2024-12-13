const Restaurant = require('../models/restaurant.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createRestaurant = catchAsync(async (req, res, next) => {
    try {
        // Check if user already has a restaurant
        const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
        
        if (existingRestaurant) {
            return next(new AppError('You already have a restaurant', 400));
        }

        // Parse JSON strings in form data
        const formData = { ...req.body };
        
        // Parse JSON fields if they are strings
        ['cuisine', 'features', 'openingHours', 'address', 'location'].forEach(field => {
            if (typeof formData[field] === 'string') {
                try {
                    formData[field] = JSON.parse(formData[field]);
                } catch (e) {
                    console.error(`Error parsing ${field}:`, e);
                }
            }
        });

        // Validate required fields
        const requiredFields = ['name', 'cuisine', 'contactNumber', 'email', 'preparationTime', 'deliveryRadius', 'minimumOrder'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
        }

        // Validate address
        if (!formData.address || !formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode || !formData.address.country) {
            return next(new AppError('Please provide complete address information (street, city, state, zipCode, country)', 400));
        }

        // Validate location
        if (!formData.location || !formData.location.coordinates || !Array.isArray(formData.location.coordinates) || formData.location.coordinates.length !== 2) {
            return next(new AppError('Please provide valid location coordinates [longitude, latitude]', 400));
        }

        // Validate cuisine array
        if (!Array.isArray(formData.cuisine) || formData.cuisine.length === 0) {
            return next(new AppError('Please provide at least one cuisine type', 400));
        }

        // Convert openingHours to a JSON string if it's an object
        if (typeof formData.openingHours === 'object') {
            formData.openingHours = JSON.stringify(formData.openingHours);
        }

        // Ensure features is an array
        if (formData.features && !Array.isArray(formData.features)) {
            formData.features = [formData.features];
        }

        // Transform features to match the schema
        if (formData.features) {
            formData.features = formData.features.map(feature => ({
                hasDelivery: feature.hasDelivery || false,
                hasTableBooking: feature.hasTableBooking || false,
                hasTakeaway: feature.hasTakeaway || false
            }));
        }

        // Handle image upload to Cloudinary
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'restaurants',
                    use_filename: true,
                    unique_filename: true
                });
                formData.image = result.secure_url;

                // Remove the local file after successful upload
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting local file:', unlinkError);
                    // Don't throw error here, as the upload was successful
                }
            } catch (error) {
                // If Cloudinary upload fails, try to clean up the local file
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting local file after failed upload:', unlinkError);
                }
                console.error('Cloudinary upload error:', error);
                return next(new AppError('Error uploading image', 500));
            }
        }

        // Create the restaurant with owner field
        const restaurant = await Restaurant.create({
            ...formData,
            owner: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: { restaurant }
        });
    } catch (error) {
        // If there's an error and we have a local file, try to clean it up
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting local file after error:', unlinkError);
            }
        }
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
    try {
        // First, find the restaurant and populate owner
        const existingRestaurant = await Restaurant.findById(req.params.id);
        
        if (!existingRestaurant) {
            return next(new AppError('No restaurant found with that ID', 404));
        }

        // Check if the current user owns this restaurant
        const restaurantOwnerId = existingRestaurant.owner._id || existingRestaurant.owner;
        if (restaurantOwnerId.toString() !== req.user._id.toString()) {
            return next(new AppError('You do not have permission to update this restaurant', 403));
        }

        // Parse JSON fields if they are strings
        const formData = { ...req.body };
        ['cuisine', 'features', 'openingHours', 'address', 'location'].forEach(field => {
            if (typeof formData[field] === 'string') {
                try {
                    formData[field] = JSON.parse(formData[field]);
                } catch (e) {
                    console.error(`Error parsing ${field}:`, e);
                }
            }
        });

        // Transform features to match the schema
        if (formData.features) {
            formData.features = {
                hasDelivery: formData.features.hasDelivery || false,
                hasTableBooking: formData.features.hasTableBooking || false,
                hasTakeaway: formData.features.hasTakeaway || false
            };
        }

        // Handle image upload to Cloudinary if there's a new image
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'restaurants',
                    use_filename: true,
                    unique_filename: true
                });
                formData.image = result.secure_url;

                // Remove the local file after successful upload
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting local file:', unlinkError);
                }
            } catch (error) {
                // If Cloudinary upload fails, try to clean up the local file
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting local file after failed upload:', unlinkError);
                }
                console.error('Cloudinary upload error:', error);
                return next(new AppError('Error uploading image', 500));
            }
        }

        // Ensure location has proper coordinates
        if (formData.location) {
            formData.location = {
                type: 'Point',
                coordinates: formData.location.coordinates || [85.5072, 20.2961]
            };
        }

        // Update the restaurant with the processed data
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            formData,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            status: 'success',
            data: { restaurant: updatedRestaurant }
        });
    } catch (error) {
        // If there's an error and we have a local file, try to clean it up
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting local file after error:', unlinkError);
            }
        }
        console.error('Restaurant update error:', error);
        return next(new AppError(error.message || 'Error updating restaurant', 500));
    }
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
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
