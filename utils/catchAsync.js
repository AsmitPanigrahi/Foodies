module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(error => {
            console.error('CatchAsync Error:', {
                functionName: fn.name,
                url: req.originalUrl,
                method: req.method,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                user: req.user ? {
                    id: req.user._id,
                    role: req.user.role
                } : null
            });
            next(error);
        });
    };
};
