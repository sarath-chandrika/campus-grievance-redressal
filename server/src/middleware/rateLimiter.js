const rateLimit = require('express-rate-limit');

// Rate limiter for complaint submission: max 10 complaints per 15 minutes per IP
const complaintRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many complaints submitted from this IP. Please try again after 15 minutes.',
  },
});

module.exports = {
  complaintRateLimiter,
};
