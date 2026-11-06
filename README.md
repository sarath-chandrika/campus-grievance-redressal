# Smart Complaint & Grievance Redressal System 🎓🏛️

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) web application engineered for educational institutions, colleges, and universities. The platform automates grievance intake with **NLP keyword priority classification**, enforces strict **Service Level Agreement (SLA) deadlines**, provides courier-style **vertical tracking timelines**, triggers **hourly cron escalations**, and offers an **executive analytics suite with PDF report export**.

---

## 🌟 Key Features

1. **Automated Auto-Priority Classification**:
   - Analyzes grievance titles and descriptions in real time against an institutional keyword dictionary.
   - Automatically assigns priority (**Critical**, **High**, **Medium**, **Low**) and suggests the designated redressal committee (*Hostel Admin, Mess Committee, Anti-Ragging Cell, etc.*).
   - Live badge preview in frontend as the student types.

2. **Guaranteed SLA Resolution Commitments**:
   - **Critical**: Resolution within **24 Hours** (sparks, electric shocks, fire, LPG gas leaks, food poisoning, assault).
   - **High**: Resolution within **3 Days** (major water leakage, power blackout, campus WiFi failure, broken elevators).
   - **Medium**: Resolution within **7 Days** (ceiling fan repair, washroom cleanliness, projector faults, mess quality).
   - **Low**: Resolution within **14 Days** (ambient noise, furniture replacement, routine checkups).

3. **Hourly SLA Breach Escort Cron Job**:
   - Background daemon powered by `node-cron` running every hour.
   - Automatically detects complaints exceeding SLA deadlines without resolution.
   - Flags tickets as `isBreached`, logs automated audit escalation remarks, dispatches escalation emails to Department Heads via Nodemailer, and broadcasts real-time socket alerts to active admins.

4. **Courier-Style Tracking & Audit Trail**:
   - Vertical milestone UI displaying complete status history (`Pending` → `In Progress` → `Resolved`).
   - Detailed timestamps, staff assignees, and administrative action notes.

5. **Post-Resolution Student Rating & Feedback**:
   - Interactive 1–5 star rating widget with feedback comments available to students once a grievance is marked `Resolved`.

6. **Administrative Analytics & PDF Report Export**:
   - Visual analytics with **Chart.js** (Bar chart of complaints by category, Doughnut chart of resolution ratios).
   - Real-time SLA breach highlighting with prominent warning borders and badges.
   - Dynamic PDF generation and streaming using **PDFKit** supporting date range and category filters.

7. **Real-time Push Notifications (Socket.io)**:
   - Dynamic room partitioning (`'admins'`, `'student-${userId}'`).
   - Push toast alerts for new grievances (`new-complaint`), status transitions (`status-updated`), and SLA breaches (`sla-breach`).

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 18 (Vite)
  - Tailwind CSS
  - React Router v6
  - Axios (with authorization interceptor)
  - Chart.js & `react-chartjs-2`
  - Socket.io-client
  - Lucide React icons
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose ODM
  - Socket.io
  - `node-cron`
  - `pdfkit`
  - `nodemailer`
  - `multer`
- **Security**:
  - JWT (`jsonwebtoken`)
  - `bcryptjs`
  - `helmet`
  - `express-rate-limit` (10 complaint submissions per 15 min per IP)
  - `express-validator`

---

## 📂 Project Structure

```
.
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, ProtectedRoute, Timeline
│   │   │   ├── student/        # PriorityBadge, RatingWidget
│   │   │   └── admin/          # Analytics & Table widgets
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # JWT state & session handling
│   │   │   └── SocketContext.jsx # Socket.io connections & toast stack
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx   # Includes 1-Click Demo Login buttons
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── student/        # StudentDashboard, SubmitComplaint, MyComplaints, Detail
│   │   │   └── admin/          # AdminDashboard, AdminComplaints, Detail, AdminReports
│   │   ├── services/           # api.js, auth, complaints, analytics
│   │   ├── utils/              # constants, formatters, SLA calculators
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # db.js, email.js (Nodemailer)
│   │   ├── controllers/        # auth, complaints, analytics
│   │   ├── cron/               # slaBreachCron.js (hourly audit)
│   │   ├── middleware/         # authMiddleware, rateLimiter, upload, validator
│   │   ├── models/             # User, Department, Complaint
│   │   ├── routes/             # authRoutes, complaintRoutes, analyticsRoutes
│   │   ├── socket/             # socketHandler.js (room management)
│   │   ├── utils/              # priorityClassifier.js, pdfGenerator.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                # Disk storage for complaint photo evidence
│   ├── seed.js                 # Database seed script (2 admins, 5 students, 15 complaints)
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local instance running on port 27017 or a MongoDB Atlas connection URI.

### 1. Backend Setup

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example` (in PowerShell, run `Copy-Item .env.example .env`). For MongoDB Atlas, replace the `MONGO_URI` placeholders with the connection string from Atlas, use your database user's password URL-encoded, and keep the database name `grievance_db`. Never commit or share the completed URI. In Atlas, add your current IP under **Network Access** and confirm the database user under **Database Access**.

For a local MongoDB server instead, set `MONGO_URI` to:
```env
MONGO_URI=mongodb://127.0.0.1:27017/grievance_db
```

The remaining required `.env` settings are:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_smart_grievance_2026
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional: Real SMTP settings (console logs mock emails if unconfigured)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Smart Grievance System" <noreply@institution.edu>
```

#### Run Database Seeding
Populate the database with **2 Administrators**, **5 Students**, and **15 realistic complaints**:
```bash
npm run seed
```

#### Start Backend Server
```bash
npm run dev
```
You can run `npm run dev` in the VS Code terminal from either the repository root (`npm --prefix server run dev`) or the `server` folder. The backend loads `server/.env` and only starts listening after MongoDB connects; connection errors are printed in the terminal.

---

### 2. Frontend Setup

In a separate terminal:
```bash
cd client
npm install

# Copy environment variables
cp .env.example .env
```

Ensure `.env` contains:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_SERVER_URL=http://localhost:5000
```

#### Start Frontend Dev Server
```bash
npm run dev
# App opens on http://localhost:5173
```

---

## 🔑 Demo Credentials

The login screen includes **1-Click Quick Demo Login** buttons for instant access:

| Role | Name | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Robert Vance | `admin1@institution.edu` | `password123` | Administration |
| **Admin** | Prof. Sarah Jenkins | `admin2@institution.edu` | `password123` | Hostel Administration |
| **Student** | Alex Mercer | `student1@institution.edu` | `password123` | Computer Science |
| **Student** | Priya Sharma | `student2@institution.edu` | `password123` | Electronics & Comm |
| **Student** | Marcus Chen | `student3@institution.edu` | `password123` | Mechanical Eng |
| **Student** | Aisha Patel | `student4@institution.edu` | `password123` | Biotechnology |
| **Student** | David Kim | `student5@institution.edu` | `password123` | Civil Engineering |

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user (Student or Admin). Validated with `express-validator`.
- `POST /api/auth/login` — Authenticate and receive signed JWT.
- `GET /api/auth/me` — Protected endpoint returning current user profile.

### 📝 Complaints & Grievances (`/api/complaints`)
- `POST /api/complaints/classify-preview` — Live NLP keyword evaluation returning auto-detected priority, SLA deadline, and suggested committee.
- `POST /api/complaints` — Lodge grievance (Protected: Student, Multer image upload, Rate limited to 10 per 15 min, Socket broadcast `new-complaint`).
- `GET /api/complaints/mine` — Student grievances with status/priority filtering.
- `GET /api/complaints` — Master complaint table (Protected: Admin, pagination, search, category, status, priority, and date range filters).
- `GET /api/complaints/:id` — Full details including populated courier tracking timeline.
- `PATCH /api/complaints/:id/status` — Update lifecycle status (`Pending`, `In Progress`, `Resolved`) with action remarks, Nodemailer email dispatch, and `status-updated` Socket alert.
- `POST /api/complaints/:id/feedback` — Submit 1–5 star rating and comment after resolution.

### 📊 Analytics & Reporting (`/api/analytics`)
- `GET /api/analytics/summary` — Aggregated counts by category, status, priority, resolution rate, and average rating.
- `GET /api/analytics/sla-breaches` — List of complaints exceeding SLA deadlines without resolution.
- `GET /api/analytics/report/pdf` — Generates and streams an executive PDF compliance document using PDFKit.

---

## ⚡ Socket.io Events & Rooms

| Event Name | Room | Direction | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Global | Client → Server | Client sends `{ role, userId }` to join appropriate rooms. |
| `new-complaint` | `admins` | Server → Client | Emitted when a student logs a new complaint. |
| `status-updated` | `student-${userId}` | Server → Client | Emitted to specific student when their grievance status changes. |
| `sla-breach` | `admins` | Server → Client | Emitted when a grievance breaches guaranteed SLA. |

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Salted bcrypt (10 rounds) pre-save hooks on User model.
2. **HTTP Header Hardening**: Secured with `helmet` with cross-origin policies enabled for static uploads.
3. **Strict File Uploads**: `multer` restricts uploads to image MIME types (`image/jpeg`, `image/png`, `image/webp`) with a 5MB size limit.
4. **Rate Limiting**: `express-rate-limit` prevents spam on complaint creation (10 requests per 15 min per IP).
5. **Token Storage Note**: Documented in code comments that enterprise production systems should transition from localStorage to `httpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS vulnerabilities.
