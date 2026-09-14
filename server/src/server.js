const http = require('http');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./socket/socketHandler');
const { initSlaCron } = require('./cron/slaBreachCron');

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Initialize hourly SLA deadline audit cron job
initSlaCron();

// Start listening
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Smart Grievance Server running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`=========================================`);
});
