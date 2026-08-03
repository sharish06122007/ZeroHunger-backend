// config/socket.js - Socket.IO configuration & helpers
const { Server } = require('socket.io');
const logger = require('./logger');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket client connected: ${socket.id}`);

    socket.on('join_room', (room) => {
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
      logger.info(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    logger.warn('Socket.IO not initialized yet');
  }
  return io;
};

const emitEvent = (eventName, data, room = null) => {
  if (!io) return;
  if (room) {
    io.to(room).emit(eventName, data);
  } else {
    io.emit(eventName, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitEvent,
};
