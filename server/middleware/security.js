const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const securityMiddleware = [
    // Set security HTTP headers
    helmet(),
    
    // Enable CORS
    cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }),
    
    // Data sanitization against XSS
    xss(),
    
    // Prevent parameter pollution
    hpp(),
    
    // Custom security headers
    (req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    }
];

module.exports = securityMiddleware; 