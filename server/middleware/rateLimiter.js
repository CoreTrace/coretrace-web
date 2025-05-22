const rateLimit = require('express-rate-limit');
const config = require('../config');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many requests from this IP, please try again after 15 minutes'
        });
    }
});

// Stricter limits for analysis endpoint
const analysisLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 analysis requests per hour
    message: {
        status: 'error',
        message: 'Too many analysis requests from this IP, please try again after an hour'
    }
});

module.exports = {
    apiLimiter,
    analysisLimiter
}; 