import { io } from 'socket.io-client';

let socket = null;
let currentUserId = null;

export const initSocket = (userId) => {
  if (!userId) {
    console.warn('Cannot init socket without userId');
    return null;
  }

  currentUserId = userId.toString();

  if (socket) {
    if (socket.connected) {
      console.log('Socket already connected, registering user:', currentUserId);
      socket.emit('register', currentUserId);
    }
    return socket;
  }

  console.log('Initializing socket connection...');
  socket = io('http://localhost:5000', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected, socket.id:', socket.id);
    if (currentUserId) {
      console.log('Registering user with socket:', currentUserId);
      socket.emit('register', currentUserId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('hired', (data) => {
    console.log('Received hired event:', data);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket');
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};

export const getSocket = () => socket;
