const Complaint = require('../models/Complaint');
const { generateGrievancePdf } = require('../utils/pdfGenerator');

// @desc    Get grievance summary analytics (counts by category, status, priority, rating)
// @route   GET /api/analytics/summary
// @access  Private (Admin)
const getSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });

    // SLA Breached (overdue & unresolved)
    const now = new Date();
    const overdue = await Complaint.countDocuments({
      slaDeadline: { $lt: now },
      status: { $ne: 'Resolved' },
    });

    // Counts by category
    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const byCategory = {
      Hostel: 0,
      Mess: 0,
      Academic: 0,
      Infrastructure: 0,
      Other: 0,
    };
    categoryAgg.forEach((item) => {
      if (byCategory[item._id] !== undefined) {
        byCategory[item._id] = item.count;
      }
    });

    // Counts by priority
    const priorityAgg = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const byPriority = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    priorityAgg.forEach((item) => {
      if (byPriority[item._id] !== undefined) {
        byPriority[item._id] = item.count;
      }
    });

    // Average rating
    const ratingAgg = await Complaint.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } },
    ]);
    const averageRating = ratingAgg.length > 0 ? ratingAgg[0].avgRating.toFixed(1) : null;
    const totalRatings = ratingAgg.length > 0 ? ratingAgg[0].totalRatings : 0;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        total,
        pending,
        inProgress,
        resolved,
        overdue,
        resolutionRate,
        averageRating,
        totalRatings,
        byCategory,
        byPriority,
      },
    });
  } catch (error) {
    console.error('Error computing analytics summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute analytics summary',
      error: error.message,
    });
  }
};

// @desc    Get all complaints past slaDeadline still not Resolved
// @route   GET /api/analytics/sla-breaches
// @access  Private (Admin)
const getSlaBreaches = async (req, res) => {
  try {
    const now = new Date();
    const breaches = await Complaint.find({
      slaDeadline: { $lt: now },
      status: { $ne: 'Resolved' },
    })
      .populate('studentId', 'name email department')
      .populate('assignedAdminId', 'name email department')
      .sort({ slaDeadline: 1 });

    return res.status(200).json({
      success: true,
      count: breaches.length,
      breaches,
    });
  } catch (error) {
    console.error('Error fetching SLA breaches:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch SLA breaches',
      error: error.message,
    });
  }
};

// @desc    Generate and stream institutional PDF report
// @route   GET /api/analytics/report/pdf
// @access  Private (Admin)
const generatePdfReport = async (req, res) => {
  try {
    const { startDate, endDate, category, status } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email department')
      .sort({ createdAt: -1 });

    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;

    const now = new Date();
    const overdue = complaints.filter(
      (c) => c.status !== 'Resolved' && new Date(c.slaDeadline) < now
    ).length;

    const ratedComplaints = complaints.filter((c) => c.rating != null);
    const avgRating =
      ratedComplaints.length > 0
        ? (
            ratedComplaints.reduce((acc, c) => acc + c.rating, 0) /
            ratedComplaints.length
          ).toFixed(1)
        : null;

    const summary = {
      total,
      pending,
      inProgress,
      resolved,
      overdue,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      averageRating: avgRating,
    };

    // Set response headers for binary PDF download
    const filename = `Grievance-Redressal-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    generateGrievancePdf(complaints, summary, { startDate, endDate, category }, res);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message,
    });
  }
};

module.exports = {
  getSummary,
  getSlaBreaches,
  generatePdfReport,
};
