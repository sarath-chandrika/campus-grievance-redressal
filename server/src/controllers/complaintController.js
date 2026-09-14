const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { classifyPriority, computeSlaDeadline, suggestDepartment } = require('../utils/priorityClassifier');
const { emitNewComplaint, emitStatusUpdated } = require('../socket/socketHandler');
const { sendStatusUpdateEmail } = require('../config/email');

// @desc    Preview auto-priority classification and SLA deadline
// @route   POST /api/complaints/classify-preview
// @access  Public / Authenticated
const classifyPreview = async (req, res) => {
  try {
    const { text, category } = req.body;
    const priority = classifyPriority(text || '');
    const slaDeadline = computeSlaDeadline(priority);
    const suggestedDepartment = suggestDepartment(category || 'Other', text || '');

    return res.status(200).json({
      success: true,
      priority,
      slaDeadline,
      suggestedDepartment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to classify preview',
      error: error.message,
    });
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Auto-compute priority and SLA
    const combinedText = `${title} ${description}`;
    const priority = classifyPriority(combinedText);
    const slaDeadline = computeSlaDeadline(priority);

    // Handle optional uploaded image
    let image = null;
    if (req.file) {
      image = `uploads/${req.file.filename}`;
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      image,
      priority,
      status: 'Pending',
      studentId: req.user._id,
      slaDeadline,
      statusHistory: [
        {
          status: 'Pending',
          updatedBy: req.user._id,
          timestamp: new Date(),
          remarks: 'Complaint lodged by student and pending administrative review.',
        },
      ],
    });

    await complaint.save();

    // Populate student details for response & socket
    await complaint.populate('studentId', 'name email department');
    await complaint.populate('statusHistory.updatedBy', 'name email role');

    // Emit real-time socket event to all admins
    emitNewComplaint(complaint);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error.message,
    });
  }
};

// @desc    Get current student's complaints
// @route   GET /api/complaints/mine
// @access  Private (Student)
const getMyComplaints = async (req, res) => {
  try {
    const { status, category, priority, sort = 'newest' } = req.query;

    const query = { studentId: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'priority') sortOption = { priority: 1 };

    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email department')
      .populate('assignedAdminId', 'name email department')
      .populate('statusHistory.updatedBy', 'name email role')
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Error fetching student complaints:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your complaints',
      error: error.message,
    });
  }
};

// @desc    Get all complaints (with filtering, pagination & sorting)
// @route   GET /api/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // SLA Breached filter
    if (req.query.breached === 'true') {
      query.status = { $ne: 'Resolved' };
      query.slaDeadline = { $lt: new Date() };
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const totalCount = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email department')
      .populate('assignedAdminId', 'name email department')
      .populate('statusHistory.updatedBy', 'name email role')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      limit: limitNum,
      complaints,
    });
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message,
    });
  }
};

// @desc    Get complaint detail by ID
// @route   GET /api/complaints/:id
// @access  Private (Owner Student or Admin)
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email department')
      .populate('assignedAdminId', 'name email department')
      .populate('statusHistory.updatedBy', 'name email role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check permissions: Must be owner or admin
    if (req.user.role !== 'admin' && !complaint.studentId._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own complaints.',
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint details',
      error: error.message,
    });
  }
};

// @desc    Update complaint status (Admin)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks = '', assignedAdminId } = req.body;

    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    if (assignedAdminId) {
      complaint.assignedAdminId = assignedAdminId;
    } else if (!complaint.assignedAdminId) {
      complaint.assignedAdminId = req.user._id;
    }

    // Push new status to history
    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
      timestamp: new Date(),
      remarks: remarks || `Status transitioned from ${oldStatus} to ${status}.`,
    });

    await complaint.save();

    // Re-populate populated fields
    await complaint.populate('assignedAdminId', 'name email department');
    await complaint.populate('statusHistory.updatedBy', 'name email role');

    // Send email to student
    if (complaint.studentId && complaint.studentId.email) {
      sendStatusUpdateEmail({
        to: complaint.studentId.email,
        studentName: complaint.studentId.name,
        complaintTitle: complaint.title,
        oldStatus,
        newStatus: status,
        remarks,
        complaintId: complaint._id,
      });
    }

    // Emit real-time socket event to student
    emitStatusUpdated(complaint.studentId._id, complaint);

    return res.status(200).json({
      success: true,
      message: `Complaint status successfully updated to ${status}`,
      complaint,
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message,
    });
  }
};

// @desc    Submit student rating & feedback after resolution
// @route   POST /api/complaints/:id/feedback
// @access  Private (Student)
const submitFeedback = async (req, res) => {
  try {
    const { rating, feedbackComment } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Verify student ownership
    if (!complaint.studentId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own complaints.',
      });
    }

    // Verify complaint is Resolved
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted once the grievance is Resolved.',
      });
    }

    complaint.rating = rating;
    complaint.feedbackComment = feedbackComment || '';
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      complaint,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
};

module.exports = {
  classifyPreview,
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  submitFeedback,
};
