const express = require('express');
const router = express.Router();
const {
  classifyPreview,
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  submitFeedback,
} = require('../controllers/complaintController');

const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { complaintRateLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const {
  createComplaintValidation,
  updateStatusValidation,
  submitFeedbackValidation,
} = require('../middleware/validator');

// Classification preview (Used for real-time priority badge typing feedback)
router.post('/classify-preview', classifyPreview);

// Create new complaint (Student only, rate limited, optional single image upload)
router.post(
  '/',
  verifyToken,
  requireRole('student'),
  complaintRateLimiter,
  upload.single('image'),
  createComplaintValidation,
  createComplaint
);

// Get student's own complaints
router.get('/mine', verifyToken, requireRole('student'), getMyComplaints);

// Get all complaints with filtering & pagination (Admin only)
router.get('/', verifyToken, requireRole('admin'), getAllComplaints);

// Get single complaint details with timeline (Student owner or Admin)
router.get('/:id', verifyToken, getComplaintById);

// Update complaint status (Admin only)
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('admin'),
  updateStatusValidation,
  updateComplaintStatus
);

// Submit feedback/rating after resolution (Student owner only)
router.post(
  '/:id/feedback',
  verifyToken,
  requireRole('student'),
  submitFeedbackValidation,
  submitFeedback
);

module.exports = router;
