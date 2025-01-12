const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Autorise toutes les origines
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Grille initiale vide
let grid = [];

// Servir les fichiers statiques
app.use(express.static('public'));

// Lorsque quelqu'un se connecte
io.on('connection', (socket) => {
    const userIp = socket.handshake.address;

    console.log(`New user connected: ${socket.id}, IP: ${userIp}`);

    // Envoyer la grille initiale au client
    socket.emit('init', grid);

    // Notifier tous les utilisateurs qu'un nouvel utilisateur s'est connecté
    io.emit('user-connected', { ip: userIp });

    // Mise à jour de la grille
    socket.on('update-cell', ({ x, y, value }) => {
        grid[y] = grid[y] || [];
        grid[y][x] = value;
        console.log(`Cell updated: (${x}, ${y}) -> ${value}`);

        // Informer les autres clients de la mise à jour
        socket.broadcast.emit('cell-updated', { x, y, value });
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Lancer le serveur
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
