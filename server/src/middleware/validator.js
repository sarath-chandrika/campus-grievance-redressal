const { body, validationResult } = require('express-validator');

// Helper to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

// Validation rules for Auth
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Role must be either student or admin'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  validate,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Validation rules for Complaints
const createComplaintValidation = [
  body('title').trim().notEmpty().withMessage('Complaint title is required'),
  body('description').trim().notEmpty().withMessage('Complaint description is required'),
  body('category').isIn(['Hostel', 'Mess', 'Academic', 'Infrastructure', 'Other']).withMessage('Invalid complaint category'),
  validate,
];

const updateStatusValidation = [
  body('status').isIn(['Pending', 'In Progress', 'Resolved']).withMessage('Invalid status value'),
  body('remarks').optional().trim(),
  validate,
];

const submitFeedbackValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('feedbackComment').optional().trim(),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createComplaintValidation,
  updateStatusValidation,
  submitFeedbackValidation,
};
