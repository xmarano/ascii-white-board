const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let grid = [];

app.use(express.static('public'));

// Connection
io.on('connection', (socket) => {
    const userIp = socket.handshake.address;

    socket.emit('init', grid);

    io.emit('user-connected', { ip: userIp });

    // Update la grille
    socket.on('update-cell', ({ x, y, value }) => {
        grid[y] = grid[y] || [];
        grid[y][x] = value;
        socket.broadcast.emit('cell-updated', { x, y, value });
    });
});

server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
