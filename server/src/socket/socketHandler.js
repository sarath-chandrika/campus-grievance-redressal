let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
    : ['http://localhost:5173'];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room based on role & userId
    // payload: { role: 'admin' | 'student', userId: string }
    socket.on('join-room', ({ role, userId }) => {
      if (role === 'admin') {
        socket.join('admins');
        console.log(`Admin joined room 'admins' [socket: ${socket.id}, user: ${userId}]`);
      }
      if (userId) {
        socket.join(`student-${userId}`);
        console.log(`User joined room 'student-${userId}' [socket: ${socket.id}]`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Helper emitters
const emitNewComplaint = (complaint) => {
  if (io) {
    io.to('admins').emit('new-complaint', complaint);
    console.log(`[Socket] Emitted 'new-complaint' for ${complaint._id} to 'admins'`);
  }
};

const emitStatusUpdated = (studentId, complaint) => {
  if (io) {
    io.to(`student-${studentId}`).emit('status-updated', complaint);
    console.log(`[Socket] Emitted 'status-updated' for ${complaint._id} to student-${studentId}`);
  }
};

const emitSlaBreach = (complaint) => {
  if (io) {
    io.to('admins').emit('sla-breach', complaint);
    console.log(`[Socket] Emitted 'sla-breach' for ${complaint._id} to 'admins'`);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNewComplaint,
  emitStatusUpdated,
  emitSlaBreach,
};
