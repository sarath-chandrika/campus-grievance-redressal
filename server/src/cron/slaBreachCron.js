const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { emitSlaBreach } = require('../socket/socketHandler');
const { sendSlaEscalationEmail } = require('../config/email');

/**
 * Checks for overdue complaints exceeding SLA deadline and flags/escalates them.
 */
const checkSlaBreaches = async () => {
  try {
    const now = new Date();

    // Find complaints that passed deadline, not resolved, and not yet flagged as breached
    const breachedComplaints = await Complaint.find({
      slaDeadline: { $lt: now },
      status: { $ne: 'Resolved' },
      isBreached: false,
    }).populate('studentId', 'name email department');

    if (breachedComplaints.length === 0) {
      console.log(`[Cron: SLA Monitor] Checked at ${now.toLocaleTimeString()} - No new SLA breaches detected.`);
      return;
    }

    console.warn(`[Cron: SLA Monitor] ⚠️ Found ${breachedComplaints.length} overdue complaint(s) exceeding SLA!`);

    // Find senior admin / HOD to send escalation email to
    const adminUser = await User.findOne({ role: 'admin' });
    const escalationEmailRecipient = adminUser ? adminUser.email : 'hod@institution.edu';

    for (const complaint of breachedComplaints) {
      // 1. Mark as breached
      complaint.isBreached = true;

      // 2. Append system escalation remark to history
      complaint.statusHistory.push({
        status: complaint.status,
        updatedBy: adminUser ? adminUser._id : complaint.studentId._id,
        timestamp: new Date(),
        remarks: `[AUTOMATED SLA ESCALATION] Complaint exceeded resolution deadline of ${new Date(complaint.slaDeadline).toLocaleString()}. High-priority alert dispatched to department authorities.`,
      });

      await complaint.save();

      // 3. Emit real-time socket alert to all connected admins
      emitSlaBreach(complaint);

      // 4. Send escalation email via Nodemailer
      sendSlaEscalationEmail({
        to: escalationEmailRecipient,
        complaintId: complaint._id,
        title: complaint.title,
        category: complaint.category,
        priority: complaint.priority,
        slaDeadline: complaint.slaDeadline,
        studentName: complaint.studentId ? complaint.studentId.name : 'Student',
      });
    }
  } catch (error) {
    console.error('[Cron: SLA Monitor Error]:', error);
  }
};

/**
 * Initializes the hourly cron job
 */
const initSlaCron = () => {
  // Run once every hour at minute 0: '0 * * * *'
  cron.schedule('0 * * * *', () => {
    console.log('[Cron] Running hourly SLA deadline audit...');
    checkSlaBreaches();
  });

  console.log('⏰ Hourly SLA Breach Cron Job registered (Runs every hour at minute 0)');
};

module.exports = {
  initSlaCron,
  checkSlaBreaches,
};
