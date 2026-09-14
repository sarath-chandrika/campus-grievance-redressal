const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Complaint = require('./src/models/Complaint');
const { classifyPriority, computeSlaDeadline } = require('./src/utils/priorityClassifier');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/grievance_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});

    // Hash default password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Admins
    console.log('Seeding Administrators...');
    const admins = await User.create([
      {
        name: 'Dr. Robert Vance',
        email: 'admin1@institution.edu',
        password: hashedPassword,
        role: 'admin',
        department: 'Administration',
      },
      {
        name: 'Prof. Sarah Jenkins',
        email: 'admin2@institution.edu',
        password: hashedPassword,
        role: 'admin',
        department: 'Hostel Administration',
      },
    ]);

    // 2. Create Departments
    console.log('Seeding Departments...');
    await Department.create([
      { name: 'Hostel Administration', headAdminId: admins[1]._id },
      { name: 'Mess & Cafeteria Committee', headAdminId: admins[0]._id },
      { name: 'Academic Affairs & Examination', headAdminId: admins[0]._id },
      { name: 'Estate & Infrastructure Maintenance', headAdminId: admins[1]._id },
      { name: 'Disciplinary & Anti-Ragging Cell', headAdminId: admins[0]._id },
    ]);

    // 3. Create Students
    console.log('Seeding Students...');
    const students = await User.create([
      {
        name: 'Alex Mercer',
        email: 'student1@institution.edu',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Science',
      },
      {
        name: 'Priya Sharma',
        email: 'student2@institution.edu',
        password: hashedPassword,
        role: 'student',
        department: 'Electronics & Communication',
      },
      {
        name: 'Marcus Chen',
        email: 'student3@institution.edu',
        password: hashedPassword,
        role: 'student',
        department: 'Mechanical Engineering',
      },
      {
        name: 'Aisha Patel',
        email: 'student4@institution.edu',
        password: hashedPassword,
        role: 'student',
        department: 'Biotechnology',
      },
      {
        name: 'David Kim',
        email: 'student5@institution.edu',
        password: hashedPassword,
        role: 'student',
        department: 'Civil Engineering',
      },
    ]);

    // 4. Create 15 Sample Complaints
    console.log('Seeding 15 Sample Complaints across categories, priorities, and statuses...');
    const now = new Date();

    const complaintsData = [
      // 1. Critical, Pending (Recent emergency)
      {
        title: 'Sparks and electric shock from geyser in Hostel C Room 304',
        description: 'While taking a shower, electric sparks were visible from the water geyser switch and mild shock was felt. Highly hazardous.',
        category: 'Hostel',
        priority: 'Critical',
        status: 'Pending',
        studentId: students[0]._id,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        slaDeadline: computeSlaDeadline('Critical', new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[0]._id,
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            remarks: 'Urgent emergency logged by student.',
          },
        ],
      },

      // 2. Critical, SLA Breached (Overdue > 24 hours!)
      {
        title: 'Severe gas leak smell near central cafeteria kitchen',
        description: 'Strong LPG gas smell observed near dining hall kitchen loading dock. Needs urgent safety inspection.',
        category: 'Mess',
        priority: 'Critical',
        status: 'In Progress',
        isBreached: true,
        studentId: students[1]._id,
        assignedAdminId: admins[0]._id,
        createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000), // 36 hours ago (exceeded 24h)
        slaDeadline: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours overdue
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[1]._id,
            timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000),
            remarks: 'Complaint filed by student.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 30 * 60 * 60 * 1000),
            remarks: 'Kitchen maintenance contacted to verify cylinder valve lines.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
            remarks: '[AUTOMATED SLA ESCALATION] SLA exceeded 24 hours. Escalated to Chief Admin.',
          },
        ],
      },

      // 3. High, In Progress (Water pipe leak)
      {
        title: 'Severe water pipe leakage flooding 2nd floor corridor',
        description: 'The overhead water supply pipe near classroom 208 has a continuous leak, creating slippery hazard on stairways.',
        category: 'Infrastructure',
        priority: 'High',
        status: 'In Progress',
        studentId: students[2]._id,
        assignedAdminId: admins[1]._id,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('High', new Date(now.getTime() - 24 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[2]._id,
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            remarks: 'Logged by student.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[1]._id,
            timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000),
            remarks: 'Plumbing contractor dispatched with replacement PVC joint.',
          },
        ],
      },

      // 4. High, Resolved with Rating
      {
        title: 'Campus wifi down in central library 3rd floor reading hall',
        description: 'No student is able to connect to the eduroam/campus WiFi router on the 3rd floor. Semester exams upcoming.',
        category: 'Infrastructure',
        priority: 'High',
        status: 'Resolved',
        studentId: students[3]._id,
        assignedAdminId: admins[0]._id,
        createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('High', new Date(now.getTime() - 72 * 60 * 60 * 1000)),
        rating: 5,
        feedbackComment: 'The IT network team replaced the faulty Cisco access point within 12 hours. Excellent speed!',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[3]._id,
            timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000),
            remarks: 'Complaint filed.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 65 * 60 * 60 * 1000),
            remarks: 'Assigned to IT Network Operations team.',
          },
          {
            status: 'Resolved',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
            remarks: 'Firmware reset and power injector swapped. Network restored at full bandwidth.',
          },
        ],
      },

      // 5. High, SLA Breached (Broken elevator)
      {
        title: 'Elevator stuck between 3rd and 4th floors in Engineering Block',
        description: 'Main lift stopped working with warning alarm beeping. Specially-abled students unable to reach 4th floor lab.',
        category: 'Infrastructure',
        priority: 'High',
        status: 'In Progress',
        isBreached: true,
        studentId: students[4]._id,
        assignedAdminId: admins[1]._id,
        createdAt: new Date(now.getTime() - 96 * 60 * 60 * 1000), // 4 days ago (> 3 days SLA)
        slaDeadline: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[4]._id,
            timestamp: new Date(now.getTime() - 96 * 60 * 60 * 1000),
            remarks: 'Submitted by student.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[1]._id,
            timestamp: new Date(now.getTime() - 80 * 60 * 60 * 1000),
            remarks: 'Otis elevator service team requested to inspect drive motor.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[1]._id,
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            remarks: '[AUTOMATED SLA ESCALATION] Exceeded 72 hours SLA. Vendor parts delay reported.',
          },
        ],
      },

      // 6. Medium, Pending (Mess food issue)
      {
        title: 'Undercooked food and unhygienic serving counters in Hostel Mess B',
        description: 'Dinner served on Friday had undercooked rice and dal. Utensils were greasy and unwashed.',
        category: 'Mess',
        priority: 'Medium',
        status: 'Pending',
        studentId: students[0]._id,
        createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Medium', new Date(now.getTime() - 10 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[0]._id,
            timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000),
            remarks: 'Grievance submitted by student.',
          },
        ],
      },

      // 7. Medium, In Progress (Ceiling fan)
      {
        title: 'Ceiling fan not working and making screeching noise in LH-3',
        description: 'The ceiling fan in Lecture Hall 3 center row is jammed and emits burning smell when switched on.',
        category: 'Academic',
        priority: 'Medium',
        status: 'In Progress',
        studentId: students[1]._id,
        assignedAdminId: admins[1]._id,
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Medium', new Date(now.getTime() - 48 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[1]._id,
            timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000),
            remarks: 'Submitted.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[1]._id,
            timestamp: new Date(now.getTime() - 30 * 60 * 60 * 1000),
            remarks: 'Campus electrician assigned to replace the motor bearing.',
          },
        ],
      },

      // 8. Medium, Resolved with Rating
      {
        title: 'Projector display flickering in CS Seminar Hall during lectures',
        description: 'The HDMI feed from the podium to the ceiling projector turns pink and disconnects every few minutes.',
        category: 'Academic',
        priority: 'Medium',
        status: 'Resolved',
        studentId: students[2]._id,
        assignedAdminId: admins[0]._id,
        createdAt: new Date(now.getTime() - 120 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Medium', new Date(now.getTime() - 120 * 60 * 60 * 1000)),
        rating: 4,
        feedbackComment: 'AV technician replaced the faulty wall HDMI cable. Works reliably now.',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[2]._id,
            timestamp: new Date(now.getTime() - 120 * 60 * 60 * 1000),
            remarks: 'Filed by student.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 100 * 60 * 60 * 1000),
            remarks: 'Media lab assistant assigned for hardware inspection.',
          },
          {
            status: 'Resolved',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 70 * 60 * 60 * 1000),
            remarks: 'High-speed shielded HDMI cable installed.',
          },
        ],
      },

      // 9. Medium, Pending (Washroom cleaning)
      {
        title: 'Irregular cleaning of washrooms on Hostel A 1st floor',
        description: 'Sanitation staff did not clean the common bathrooms over the weekend. Soap dispensers are empty.',
        category: 'Hostel',
        priority: 'Medium',
        status: 'Pending',
        studentId: students[3]._id,
        createdAt: new Date(now.getTime() - 15 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Medium', new Date(now.getTime() - 15 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[3]._id,
            timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000),
            remarks: 'Complaint submitted.',
          },
        ],
      },

      // 10. Low, Pending (Noise)
      {
        title: 'Excessive noise late night near hostel courtyard',
        description: 'Loud music and shouting after 11 PM near the open cafeteria benches disturbing students during exam week.',
        category: 'Hostel',
        priority: 'Low',
        status: 'Pending',
        studentId: students[4]._id,
        createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Low', new Date(now.getTime() - 18 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[4]._id,
            timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000),
            remarks: 'Reported by student.',
          },
        ],
      },

      // 11. Low, Resolved with Rating
      {
        title: 'Broken chair in Reading Room 2 needs replacement',
        description: 'One of the study chairs has a broken armrest with exposed sharp edge.',
        category: 'Infrastructure',
        priority: 'Low',
        status: 'Resolved',
        studentId: students[0]._id,
        assignedAdminId: admins[1]._id,
        createdAt: new Date(now.getTime() - 200 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Low', new Date(now.getTime() - 200 * 60 * 60 * 1000)),
        rating: 5,
        feedbackComment: 'Replaced with a brand new ergonomic study chair. Thank you!',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[0]._id,
            timestamp: new Date(now.getTime() - 200 * 60 * 60 * 1000),
            remarks: 'Submitted.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[1]._id,
            timestamp: new Date(now.getTime() - 160 * 60 * 60 * 1000),
            remarks: 'Carpenter notified to replace damaged unit.',
          },
          {
            status: 'Resolved',
            updatedBy: admins[1]._id,
            timestamp: new Date(now.getTime() - 120 * 60 * 60 * 1000),
            remarks: 'Damaged chair removed and replaced.',
          },
        ],
      },

      // 12. Low, In Progress (Dust)
      {
        title: 'Dust accumulation on notice board glass in Academic Block',
        description: 'The glass cover on the department notice board is dusty and difficult to read exam circulars.',
        category: 'Academic',
        priority: 'Low',
        status: 'In Progress',
        studentId: students[1]._id,
        assignedAdminId: admins[0]._id,
        createdAt: new Date(now.getTime() - 40 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Low', new Date(now.getTime() - 40 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[1]._id,
            timestamp: new Date(now.getTime() - 40 * 60 * 60 * 1000),
            remarks: 'Logged.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000),
            remarks: 'Included in daily housekeeping maintenance round.',
          },
        ],
      },

      // 13. Critical, Resolved with Rating (Food poisoning alert)
      {
        title: 'Suspected food poisoning after hostel mess dinner',
        description: 'Multiple students suffered vomiting and cramps after consuming paneer dish in Mess A on Wednesday.',
        category: 'Mess',
        priority: 'Critical',
        status: 'Resolved',
        studentId: students[2]._id,
        assignedAdminId: admins[0]._id,
        createdAt: new Date(now.getTime() - 150 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Critical', new Date(now.getTime() - 150 * 60 * 60 * 1000)),
        rating: 5,
        feedbackComment: 'Immediate medical assistance was provided and dairy vendor was inspected and changed.',
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[2]._id,
            timestamp: new Date(now.getTime() - 150 * 60 * 60 * 1000),
            remarks: 'Emergency medical grievance reported.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 148 * 60 * 60 * 1000),
            remarks: 'Health center dispatched medical team. Food safety audit initiated immediately.',
          },
          {
            status: 'Resolved',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 135 * 60 * 60 * 1000),
            remarks: 'Vendor audited, food samples sent for microbiological test, and all students treated.',
          },
        ],
      },

      // 14. Academic, High (Exam clash)
      {
        title: 'Mid-term exam clash for Elective CS402 and Data Science DS301',
        description: 'Both final examination papers have been scheduled at 10 AM on Monday in the published draft timetable.',
        category: 'Academic',
        priority: 'High',
        status: 'Pending',
        studentId: students[3]._id,
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('High', new Date(now.getTime() - 8 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[3]._id,
            timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
            remarks: 'Submitted for controller of examinations review.',
          },
        ],
      },

      // 15. Other, Medium (Library ID card)
      {
        title: 'Library RFID barrier gate not recognizing student barcode',
        description: 'The automated turnstile at the library entrance beeps invalid card for batch 2024 students.',
        category: 'Other',
        priority: 'Medium',
        status: 'In Progress',
        studentId: students[4]._id,
        assignedAdminId: admins[0]._id,
        createdAt: new Date(now.getTime() - 35 * 60 * 60 * 1000),
        slaDeadline: computeSlaDeadline('Medium', new Date(now.getTime() - 35 * 60 * 60 * 1000)),
        statusHistory: [
          {
            status: 'Pending',
            updatedBy: students[4]._id,
            timestamp: new Date(now.getTime() - 35 * 60 * 60 * 1000),
            remarks: 'Logged.',
          },
          {
            status: 'In Progress',
            updatedBy: admins[0]._id,
            timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000),
            remarks: 'Database administrator syncing student RFID card table with library server.',
          },
        ],
      },
    ];

    await Complaint.insertMany(complaintsData);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Created Users:');
    console.log('  🛡️ Admin 1: admin1@institution.edu (Pass: password123)');
    console.log('  🛡️ Admin 2: admin2@institution.edu (Pass: password123)');
    console.log('  🎓 Student 1: student1@institution.edu (Pass: password123)');
    console.log('  🎓 Student 2: student2@institution.edu (Pass: password123)');
    console.log('  🎓 Student 3: student3@institution.edu (Pass: password123)');
    console.log('  🎓 Student 4: student4@institution.edu (Pass: password123)');
    console.log('  🎓 Student 5: student5@institution.edu (Pass: password123)');
    console.log(`\nCreated 15 complaints covering:`);
    console.log('  • Priorities: Critical (24h), High (3d), Medium (7d), Low (14d)');
    console.log('  • Statuses: Pending, In Progress, Resolved (with ratings & comments)');
    console.log('  • SLA Breaches: Real-time overdue complaints flagged for demonstration');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
