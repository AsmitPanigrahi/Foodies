const MenuItem = require('../models/menuItem.model');
const Restaurant = require('../models/restaurant.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createMenuItem = catchAsync(async (req, res, next) => {
    const restaurant = await Restaurant.findById(req.body.restaurant).populate('owner');

    if (!restaurant) {
        return next(new AppError('No restaurant found with that ID', 404));
    }

    // Check if user is the restaurant owner

    console.log('Debug Info:');
    console.log('Logged-in user ID:', req.user._id);
    console.log('Restaurant owner ID:', restaurant.owner._id);
    console.log('Types:', {
        userIdType: typeof req.user._id,
        ownerIdType: typeof restaurant.owner._id
    });
    console.log('String values:', {
        userIdString: req.user._id.toString(),
        ownerIdString: restaurant.owner._id.toString()
    });


    if (restaurant.owner._id.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only add items to your own restaurant', 403));
    }

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { menuItem }
    });
});

exports.getAllMenuItems = catchAsync(async (req, res, next) => {
    const filter = {};

    // Filter by restaurant if provided
    if (req.params.restaurantId) filter.restaurant = req.params.restaurantId;

    // Apply other filters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isVegetarian) filter.isVegetarian = req.query.isVegetarian === 'true';
    if (req.query.isVegan) filter.isVegan = req.query.isVegan === 'true';
    if (req.query.isGlutenFree) filter.isGlutenFree = req.query.isGlutenFree === 'true';
    if (req.query.isAvailable) filter.isAvailable = req.query.isAvailable === 'true';

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    const menuItems = await MenuItem.find(filter);

    res.status(200).json({
        status: 'success',
        results: menuItems.length,
        data: { menuItems }
    });
});

exports.getMenuItem = catchAsync(async (req, res, next) => {
    const menuItem = await MenuItem.findById(req.params.id)
        .populate('restaurant')
        .populate('reviews');

    if (!menuItem) {
        return next(new AppError('No menu item found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { menuItem }
    });
});

exports.updateMenuItem = catchAsync(async (req, res, next) => {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
        return next(new AppError('No menu item found with that ID', 404));
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant).populate('owner');

    // Check if user is the restaurant owner
    if (restaurant.owner._id.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only update items in your own restaurant', 403));
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: { menuItem: updatedMenuItem }
    });
});

exports.deleteMenuItem = catchAsync(async (req, res, next) => {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
        return next(new AppError('No menu item found with that ID', 404));
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant).populate('owner');

    // Check if user is the restaurant owner
    if (restaurant.owner._id.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only delete items from your own restaurant', 403));
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getPopularItems = catchAsync(async (req, res, next) => {
    const popularItems = await MenuItem.find({ isPopular: true })
        .limit(10)
        .populate('restaurant');

    res.status(200).json({
        status: 'success',
        results: popularItems.length,
        data: { menuItems: popularItems }
    });
});
