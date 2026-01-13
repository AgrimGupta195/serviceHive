const { Server } = require('socket.io');

let io = null;
const userSockets = new Map(); 
function init(server) {
    if (io) return io;
    io = new Server(server, {
        cors: { origin: ['http://localhost:3000','http://localhost:5173','http://localhost:5174','*'] }
    });

    io.on('connection', (socket) => {
        console.log('New socket connection:', socket.id);
        socket.on('register', (userId) => {
            if (!userId) {
                console.warn('Register called without userId');
                return;
            }
            const userIdStr = userId.toString();
            const set = userSockets.get(userIdStr) || new Set();
            set.add(socket.id);
            userSockets.set(userIdStr, set);
            console.log(`User ${userIdStr} registered with socket ${socket.id}. Total sockets for user: ${set.size}`);
        });
        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
            for (const [userId, set] of userSockets.entries()) {
                if (set.has(socket.id)) {
                    set.delete(socket.id);
                    if (set.size === 0) userSockets.delete(userId);
                    console.log(`Removed socket ${socket.id} from user ${userId}`);
                }
            }
        });
    });

    return io;
}

function emitToUser(userId, event, payload) {
    if (!io) {
        console.warn('Socket.io not initialized');
        return false;
    }
    const userIdStr = userId?.toString();
    const sockets = userSockets.get(userIdStr);
    if (!sockets || sockets.size === 0) {
        console.warn(`No sockets found for user ${userIdStr}. Registered users:`, Array.from(userSockets.keys()));
        return false;
    }
    console.log(`Emitting ${event} to user ${userIdStr} on ${sockets.size} socket(s)`);
    for (const sockId of sockets) {
        io.to(sockId).emit(event, payload);
    }
    return true;
}

module.exports = { init, emitToUser };
