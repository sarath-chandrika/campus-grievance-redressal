const PDFDocument = require('pdfkit');

/**
 * Generates an institutional PDF grievance report and streams it to the HTTP response
 * @param {Array} complaints - List of complaint documents
 * @param {Object} summary - Analytics summary counts
 * @param {Object} filters - Applied filters (date range, category)
 * @param {Object} res - Express response stream
 */
const generateGrievancePdf = (complaints, summary, filters, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream document directly into response
  doc.pipe(res);

  // Colors
  const primaryColor = '#1e3a8a';
  const secondaryColor = '#475569';
  const accentColor = '#2563eb';
  const breachColor = '#dc2626';

  // --- HEADER ---
  doc
    .fillColor(primaryColor)
    .fontSize(20)
    .text('Smart Complaint & Grievance Redressal System', { align: 'left' });

  doc
    .fillColor(secondaryColor)
    .fontSize(10)
    .text('Official Institutional Compliance & Audit Report', { align: 'left' })
    .moveDown(0.5);

  doc
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .stroke()
    .moveDown(1);

  // Report Metadata
  doc
    .fillColor(secondaryColor)
    .fontSize(9)
    .text(`Report Generated On: ${new Date().toLocaleString()}`, { continued: true })
    .text(`   |   Date Filter: ${filters.startDate || 'All Time'} to ${filters.endDate || 'Present'}`, {
      continued: true,
    })
    .text(`   |   Category: ${filters.category || 'All Categories'}`)
    .moveDown(1.5);

  // --- EXECUTIVE SUMMARY STATS BOX ---
  const boxTop = doc.y;
  doc
    .rect(40, boxTop, 515, 65)
    .fillAndStroke('#f8fafc', '#e2e8f0');

  doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
  doc.text('EXECUTIVE AUDIT SUMMARY', 55, boxTop + 10);

  doc.font('Helvetica').fontSize(9).fillColor(secondaryColor);
  doc.text(`Total Complaints: ${summary.total}`, 55, boxTop + 28);
  doc.text(`Pending Review: ${summary.pending}`, 175, boxTop + 28);
  doc.text(`In Progress: ${summary.inProgress}`, 295, boxTop + 28);
  doc.text(`Resolved: ${summary.resolved}`, 415, boxTop + 28);

  doc.fillColor(breachColor).font('Helvetica-Bold');
  doc.text(`SLA Breached / Overdue: ${summary.overdue}`, 55, boxTop + 45);

  doc.fillColor(secondaryColor).font('Helvetica');
  doc.text(`Resolution Rate: ${summary.resolutionRate}%`, 295, boxTop + 45);
  doc.text(`Average Rating: ${summary.averageRating || 'N/A'}/5`, 415, boxTop + 45);

  doc.y = boxTop + 80;
  doc.moveDown(1);

  // --- COMPLAINTS AUDIT TABLE ---
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold');
  doc.text(`ITEMIZED GRIEVANCE AUDIT LOG (${complaints.length} Records)`);
  doc.moveDown(0.5);

  // Table Headers
  const colX = {
    id: 40,
    date: 95,
    category: 160,
    priority: 235,
    status: 300,
    sla: 375,
    title: 450,
  };

  const headerY = doc.y;
  doc.rect(40, headerY, 515, 20).fill('#e2e8f0');

  doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold');
  doc.text('TICKET', colX.id + 5, headerY + 6);
  doc.text('DATE', colX.date, headerY + 6);
  doc.text('CATEGORY', colX.category, headerY + 6);
  doc.text('PRIORITY', colX.priority, headerY + 6);
  doc.text('STATUS', colX.status, headerY + 6);
  doc.text('SLA DEADLINE', colX.sla, headerY + 6);
  doc.text('SUBJECT', colX.title, headerY + 6);

  doc.y = headerY + 22;

  // Table Rows
  doc.font('Helvetica').fontSize(8);
  const now = new Date();

  complaints.forEach((c, index) => {
    // Add page if near bottom
    if (doc.y > 750) {
      doc.addPage();
      doc.y = 40;
    }

    const rowY = doc.y;
    const isBreached = c.status !== 'Resolved' && new Date(c.slaDeadline) < now;

    // Alternating zebra row background
    if (isBreached) {
      doc.rect(40, rowY, 515, 20).fill('#fef2f2');
    } else if (index % 2 === 1) {
      doc.rect(40, rowY, 515, 20).fill('#f8fafc');
    }

    doc.fillColor(isBreached ? '#b91c1c' : '#334155');
    doc.text(`#${c._id.toString().slice(-6).toUpperCase()}`, colX.id + 5, rowY + 6);
    doc.text(new Date(c.createdAt).toLocaleDateString(), colX.date, rowY + 6);
    doc.text(c.category, colX.category, rowY + 6);
    doc.text(c.priority, colX.priority, rowY + 6);
    doc.text(c.status, colX.status, rowY + 6);
    doc.text(
      isBreached ? 'BREACHED' : new Date(c.slaDeadline).toLocaleDateString(),
      colX.sla,
      rowY + 6
    );

    const truncatedTitle = c.title.length > 20 ? `${c.title.substring(0, 18)}...` : c.title;
    doc.text(truncatedTitle, colX.title, rowY + 6);

    doc.y = rowY + 20;
  });

  // Footer on all pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text(
        `Institutional Grievance Redressal System • Confidential Administrative Document • Page ${i + 1} of ${range.count}`,
        40,
        800,
        { align: 'center', width: 515 }
      );
  }

  doc.end();
};

module.exports = {
  generateGrievancePdf,
};
