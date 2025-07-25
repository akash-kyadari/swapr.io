const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Swap = require('../models/Swap');
const User = require('../models/User');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get token from cookies
      const cookies = socket.handshake.headers.cookie;
      let token = null;
      
      if (cookies) {
        const tokenMatch = cookies.match(/token=([^;]+)/);
        if (tokenMatch) {
          token = tokenMatch[1];
        }
      }
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {

    // Join swap room for real-time messaging
    socket.on('join_swap_room', async (data) => {
      const { swapId, userId } = data;
      socket.join(`swap-${swapId}`);
      
      // Get user info for notifications
      const user = await User.findById(userId).select('name');
      if (user) {
        socket.to(`swap-${swapId}`).emit('user_joined', {
          swapId,
          userId,
          userName: user.name
        });
      }
      
    });

    // Leave swap room
    socket.on('leave_swap_room', async (data) => {
      const { swapId, userId } = data;
      socket.leave(`swap-${swapId}`);
      
      // Get user info for notifications
      const user = await User.findById(userId).select('name');
      if (user) {
        socket.to(`swap-${swapId}`).emit('user_left', {
          swapId,
          userId,
          userName: user.name
        });
      }
      
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { swapId, userId, userName } = data;
      socket.to(`swap-${swapId}`).emit('typing_start', {
        swapId,
        userId,
        userName
      });
    });

    socket.on('typing_stop', (data) => {
      const { swapId, userId, userName } = data;
      socket.to(`swap-${swapId}`).emit('typing_stop', {
        swapId,
        userId,
        userName
      });
    });

    // Handle task completion
    socket.on('task_completed', async (data) => {
      const { swapId, userId } = data;
      
      try {
        // Fetch updated swap data
        const updatedSwap = await Swap.findById(swapId)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar');
        
        if (updatedSwap) {
          socket.to(`swap-${swapId}`).emit('swap_updated', updatedSwap);
        }
      } catch (error) {
        console.error('Error fetching updated swap:', error);
      }
    });

    // Handle task approval
    socket.on('task_approved', async (data) => {
      const { swapId, userId } = data;
      
      try {
        // Fetch updated swap data
        const updatedSwap = await Swap.findById(swapId)
          .populate('sender', 'name avatar')
          .populate('receiver', 'name avatar');
        
        if (updatedSwap) {
          socket.to(`swap-${swapId}`).emit('swap_updated', updatedSwap);
        }
      } catch (error) {
        console.error('Error fetching updated swap:', error);
      }
    });

    // Handle message sending
    socket.on('send_message', (data) => {
      const { swapId, message } = data;
      socket.to(`swap-${swapId}`).emit('new_message', message);
    });

    // Handle message seen events
    socket.on('messages_seen', (data) => {
      const { swapId, userId } = data;
      // Notify other user(s) in the room that messages have been seen by this user
      socket.to(`swap-${swapId}`).emit('messages_seen', { swapId, userId });
    });

    socket.on('disconnect', () => {
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Function to emit new message to swap room
const emitNewMessage = (message) => {
  if (io) {
    io.to(`swap-${message.swap}`).emit('new_message', message);
  }
};

module.exports = { initializeSocket, getIO, emitNewMessage }; 