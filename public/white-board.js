const socket = io();

const gridElement = document.getElementById('grid');
// Hauteur des cellules
const cellWidth = 10;
const cellHeight = 16;
// Nb de colonnes
const gridWidth = Math.floor(window.innerWidth / cellWidth);
const gridHeight = Math.floor(window.innerHeight / cellHeight);

const createCell = (x, y) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.contentEditable = true;
    cell.dataset.x = x;
    cell.dataset.y = y;

    cell.addEventListener('focus', () => {
        cell.setSelectionRange(0, cell.value.length);
        cell.blur();
        cell.focus();
    });

    // 1 seul caractère
    cell.addEventListener('input', () => {
        const value = cell.innerText.slice(0, 1);
        cell.innerText = value;
        socket.emit('update-cell', { x, y, value });

        // Cellule suivante
        const nextX = x + 1 < gridWidth ? x + 1 : 0;
        const nextY = x + 1 < gridWidth ? y : y + 1;

        if (nextY < gridHeight) {
            const nextCell = document.querySelector(`.cell[data-x="${nextX}"][data-y="${nextY}"]`);
            if (nextCell) {
                nextCell.focus();
            }
        }
    });

    // Event keys
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

// Initialisation de la grille
socket.on('init', (grid) => {
    gridElement.innerHTML = '';
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = createCell(x, y);
            cell.innerText = grid[y] && grid[y][x] ? grid[y][x] : '';
            gridElement.appendChild(cell);
        }
    }
});

// Update la cellule
socket.on('cell-updated', ({ x, y, value }) => {
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    if (cell) {
        cell.innerText = value;
    }
});

// Initialisation locale de la grille si aucune donnée n'est reçue
socket.on('connect', () => {
    if (!gridElement.childNodes.length) {
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const cell = createCell(x, y);
                gridElement.appendChild(cell);
            }
        }
    }
});