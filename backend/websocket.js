// backend/websocket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const setupWebSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Make io globally available
  global.io = io;

  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.is_active) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join user's personal room
    socket.join(`user_${socket.userId}`);
    
    // Join role-based rooms
    socket.join(`role_${socket.userRole}`);
    
    // Handle joining specific rooms (e.g., project rooms)
    socket.on('join-room', (roomName) => {
      // Validate room access here if needed
      socket.join(roomName);
      console.log(`User ${socket.userId} joined room ${roomName}`);
    });
    
    // Handle leaving rooms
    socket.on('leave-room', (roomName) => {
      socket.leave(roomName);
      console.log(`User ${socket.userId} left room ${roomName}`);
    });
    
    // Handle real-time messaging
    socket.on('send-message', async (data) => {
      const { roomName, message } = data;
      
      // Validate and save message to database if needed
      
      // Broadcast to room
      io.to(roomName).emit('new-message', {
        userId: socket.userId,
        message,
        timestamp: new Date()
      });
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
      const { roomName } = data;
      socket.to(roomName).emit('user-typing', {
        userId: socket.userId
      });
    });
    
    socket.on('stop-typing', (data) => {
      const { roomName } = data;
      socket.to(roomName).emit('user-stop-typing', {
        userId: socket.userId
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Helper functions for emitting events from other parts of the application
const emitToUser = (userId, event, data) => {
  if (global.io) {
    global.io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (global.io) {
    global.io.to(`role_${role}`).emit(event, data);
  }
};

const emitToRoom = (roomName, event, data) => {
  if (global.io) {
    global.io.to(roomName).emit(event, data);
  }
};

const broadcastToAll = (event, data) => {
  if (global.io) {
    global.io.emit(event, data);
  }
};

module.exports = {
  setupWebSocket,
  emitToUser,
  emitToRole,
  emitToRoom,
  broadcastToAll
};