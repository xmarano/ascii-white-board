const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Grille centralisée (début vide)
const grid = [];

// Servir les fichiers statiques
app.use(express.static('public'));

// Lorsque quelqu'un se connecte
io.on('connection', (socket) => {
    const userIp = socket.handshake.address;
    console.log(`New user connected: ${socket.id}, IP: ${userIp}`);

    // Envoyer la grille actuelle au nouvel utilisateur
    socket.emit('init', grid);

    // Diffuser une notification aux autres utilisateurs
    io.emit('user-connected', { ip: userIp });

    // Mise à jour de la grille
    socket.on('update-cell', ({ x, y, value }) => {
        // Créer des lignes vides si nécessaire
        while (grid.length <= y) {
            grid.push([]);
        }
        while (grid[y].length <= x) {
            grid[y].push('');
        }

        // Mettre à jour la cellule
        grid[y][x] = value;
        console.log(`Cell updated: (${x}, ${y}) -> "${value}"`);

        // Diffuser la mise à jour à tous les autres utilisateurs
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
