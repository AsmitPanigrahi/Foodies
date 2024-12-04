const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = (io) => {
    // Middleware for authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                throw new Error('Authentication error');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user._id}`);

        // Join user's personal room
        socket.join(socket.user._id.toString());

        // Join restaurant room if user is restaurant owner
        if (socket.user.role === 'restaurant-owner') {
            socket.join(`restaurant_${socket.user._id}`);
        }

        // Handle joining order room for tracking
        socket.on('join_order_room', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`User joined order room: ${orderId}`);
        });

        // Handle order status updates
        socket.on('update_order_status', async (data) => {
            const { orderId, status } = data;
            io.to(`order_${orderId}`).emit('order_status_changed', {
                orderId,
                status,
                timestamp: new Date()
            });
        });

        // Handle delivery location updates
        socket.on('update_delivery_location', (data) => {
            const { orderId, location } = data;
            io.to(`order_${orderId}`).emit('delivery_location_updated', {
                orderId,
                location,
                timestamp: new Date()
            });
        });

        // Handle new order notifications for restaurants
        socket.on('new_order_notification', (data) => {
            const { restaurantId } = data;
            io.to(`restaurant_${restaurantId}`).emit('new_order', data);
        });

        // Handle chat messages between customer and delivery person
        socket.on('chat_message', (data) => {
            const { orderId, message } = data;
            io.to(`order_${orderId}`).emit('new_message', {
                ...message,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user._id}`);
        });
    });

    return io;
};
