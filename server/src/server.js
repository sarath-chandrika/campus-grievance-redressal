const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./socket/socketHandler');
const { initSlaCron } = require('./cron/slaBreachCron');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  initSocket(server);
  initSlaCron();

  server.listen(PORT, () => {
    console.log('=========================================');
    console.log(`Smart Grievance Server running on port ${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log('=========================================');
  });
};

startServer().catch((error) => {
  console.error(`Backend startup failed: ${error.message}`);
  console.error('Check server/.env, Atlas database credentials, and Network Access settings.');
  process.exitCode = 1;
});
