const socket = io();

const gridElement = document.getElementById('grid');
// Hauteur et largeur des cellules
const cellWidth = 10;
const cellHeight = 16;

// Fonction pour créer une cellule
const createCell = (x, y) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.contentEditable = true;
    cell.dataset.x = x;
    cell.dataset.y = y;

    // Restreindre à 1 seul caractère
    cell.addEventListener('input', () => {
        const value = cell.innerText.slice(0, 1);
        cell.innerText = value;
        socket.emit('update-cell', { x, y, value });

        // Passer à la cellule suivante
        const nextX = x + 1 < gridWidth ? x + 1 : 0;
        const nextY = x + 1 < gridWidth ? y : y + 1;

        if (nextY < gridHeight) {
            const nextCell = document.querySelector(`.cell[data-x="${nextX}"][data-y="${nextY}"]`);
            if (nextCell) nextCell.focus();
        }
    });

    // Gestion des touches
    cell.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key === 'ArrowRight') {
            const nextCell = document.querySelector(`.cell[data-x="${x + 1}"][data-y="${y}"]`);
            if (nextCell) nextCell.focus();
            e.preventDefault();
        } else if (key === 'ArrowLeft') {
            const prevCell = document.querySelector(`.cell[data-x="${x - 1}"][data-y="${y}"]`);
            if (prevCell) prevCell.focus();
            e.preventDefault();
        } else if (key === 'ArrowUp') {
            const aboveCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y - 1}"]`);
            if (aboveCell) aboveCell.focus();
            e.preventDefault();
        } else if (key === 'ArrowDown') {
            const belowCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y + 1}"]`);
            if (belowCell) belowCell.focus();
            e.preventDefault();
        } else if (key === 'Enter') {
            const nextRowCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y + 1}"]`);
            if (nextRowCell) nextRowCell.focus();
            e.preventDefault();
        } else if (key === 'Backspace') {
            cell.innerText = '';
            socket.emit('update-cell', { x, y, value: '' });

            const prevCell = document.querySelector(`.cell[data-x="${x - 1}"][data-y="${y}"]`);
            if (prevCell) {
                prevCell.innerText = '';
                socket.emit('update-cell', { x: x - 1, y, value: '' });
                prevCell.focus();
            }
            e.preventDefault();
        }
    });
    return cell;
};

// Génération de la grille
const generateGrid = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    gridWidth = Math.ceil(screenWidth / cellWidth);
    gridHeight = Math.ceil(screenHeight / cellHeight);

    gridElement.innerHTML = ''; // Réinitialise la grille

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = createCell(x, y);
            gridElement.appendChild(cell);
        }
    }
};

// Générez la grille initiale
generateGrid();

// Ajustez la grille lors du redimensionnement de la fenêtre
window.addEventListener('resize', generateGrid);

// Gestion des clics sur le fond blanc
document.addEventListener('click', (e) => {
    const gridRect = gridElement.getBoundingClientRect();

    if (
        e.clientX >= gridRect.left &&
        e.clientX <= gridRect.right &&
        e.clientY >= gridRect.top &&
        e.clientY <= gridRect.bottom
    ) {
        const x = Math.floor((e.clientX - gridRect.left) / cellWidth);
        const y = Math.floor((e.clientY - gridRect.top) / cellHeight);

        let cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (!cell) {
            cell = createCell(x, y);
            gridElement.appendChild(cell);
        }
        cell.focus();
    }
});

// Réception des données du serveur
socket.on('init', (grid) => {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = createCell(x, y);
            cell.innerText = grid[y] && grid[y][x] ? grid[y][x] : '';
            gridElement.appendChild(cell);
        }
    }
});

// Mettre à jour les cellules
socket.on('cell-updated', ({ x, y, value }) => {
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    if (cell) cell.innerText = value;
});
