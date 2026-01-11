const { Server } = require('socket.io');

let io = null;
const userSockets = new Map(); 
function init(server) {
    if (io) return io;
    io = new Server(server, {
        cors: { origin: ['http://localhost:3000','http://localhost:5173','http://localhost:5174','*'] }
    });

    io.on('connection', (socket) => {
        socket.on('register', (userId) => {
            if (!userId) return;
            const set = userSockets.get(userId) || new Set();
            set.add(socket.id);
            userSockets.set(userId, set);
        });
        socket.on('disconnect', () => {
            for (const [userId, set] of userSockets.entries()) {
                if (set.has(socket.id)) {
                    set.delete(socket.id);
                    if (set.size === 0) userSockets.delete(userId);
                }
            }
        });
    });

    return io;
}

function emitToUser(userId, event, payload) {
    if (!io) return false;
    const sockets = userSockets.get(userId?.toString());
    if (!sockets) return false;
    for (const sockId of sockets) {
        io.to(sockId).emit(event, payload);
    }
    return true;
}

module.exports = { init, emitToUser };
