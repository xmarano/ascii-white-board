// Hauteur et largeur des cellules
const cellWidth = 10;
const cellHeight = 16;
const gridElement = document.getElementById('grid'); // Élément de la grille

// Définir la taille de la grille (dépendante de la taille de l'écran)
let gridWidth, gridHeight;

// Sauvegarder la grille dans le localStorage
function updateLocalStorage(gridData) {
    localStorage.setItem('gridData', JSON.stringify(gridData));
}

// Charger la grille depuis le localStorage
function loadFromLocalStorage() {
    return JSON.parse(localStorage.getItem('gridData')) || [];
}

// Ajouter le texte de bienvenue lors de la première connexion
function addWelcomeText() {
    const welcomeText = ['Ascii', 'White', 'Board'];

    // Calculer le centre de la grille
    const centerX = Math.floor(gridWidth / 2) - Math.floor(welcomeText[0].length / 2);
    const centerY = Math.floor(gridHeight / 2) - Math.floor(welcomeText.length / 2);

    welcomeText.forEach((line, index) => {
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
            const cell = document.querySelector(`.cell[data-x="${centerX + charIndex}"][data-y="${centerY + index}"]`);
            if (cell) {
                cell.innerText = line[charIndex];
            }
        }
    });

    // Sélectionner la cellule juste après "Board"
    const afterBoardX = centerX + welcomeText[2].length;
    const afterBoardY = centerY + welcomeText.length - 1;
    const nextCell = document.querySelector(`.cell[data-x="${afterBoardX}"][data-y="${afterBoardY}"]`);
    if (nextCell) {
        nextCell.focus(); // Mettre le focus sur la cellule après "Board"
    }
}

// Créer une cellule
function createCell(x, y, value = '') {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.contentEditable = true;
    cell.dataset.x = x;
    cell.dataset.y = y;
    cell.innerText = value;

    // Ajouter les événements de saisie et de suppression
    cell.addEventListener('input', () => handleCellInput(cell, x, y));
    cell.addEventListener('keydown', (e) => handleKeyDown(e, cell, x, y));

    return cell;
}

// Gérer la saisie dans la cellule
function handleCellInput(cell, x, y) {
    const value = cell.innerText.slice(0, 1); // Limiter à un caractère
    cell.innerText = value;

    // Sauvegarder la grille après chaque modification
    updateGridData();

    // Passer à la cellule suivante (x + 1, y)
    moveToNextCell(x, y);
}

// Gérer les événements clavier (flèches, backspace, etc.)
function handleKeyDown(e, cell, x, y) {
    const key = e.key;

    if (key === 'ArrowRight') {
        moveToNextCell(x, y);
        e.preventDefault();
    } else if (key === 'ArrowLeft') {
        moveToPreviousCell(x, y);
        e.preventDefault();
    } else if (key === 'ArrowUp') {
        moveToAboveCell(x, y);
        e.preventDefault();
    } else if (key === 'ArrowDown') {
        moveToBelowCell(x, y);
        e.preventDefault();
    } else if (key === 'Enter') {
        moveToNextRowCell(x, y);
        e.preventDefault();
    } else if (key === 'Backspace') {
        deleteAndMoveBack(x, y);
        e.preventDefault();
    }
}

// Déplacer vers la cellule suivante
function moveToNextCell(x, y) {
    let nextX = x + 1;
    let nextY = y;

    if (nextX >= gridWidth) {
        nextX = 0;
        nextY += 1;
    }

    focusCell(nextX, nextY);
}

// Déplacer vers la cellule précédente
function moveToPreviousCell(x, y) {
    let prevX = x - 1;
    let prevY = y;

    if (prevX < 0) {
        prevX = gridWidth - 1;
        prevY -= 1;
    }

    focusCell(prevX, prevY);
}

// Déplacer vers la cellule au-dessus
function moveToAboveCell(x, y) {
    const aboveCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y - 1}"]`);
    if (aboveCell) aboveCell.focus();
}

// Déplacer vers la cellule en dessous
function moveToBelowCell(x, y) {
    const belowCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y + 1}"]`);
    if (belowCell) belowCell.focus();
}

// Déplacer vers la cellule suivante sur la ligne suivante
function moveToNextRowCell(x, y) {
    const nextRowCell = document.querySelector(`.cell[data-x="${x}"][data-y="${y + 1}"]`);
    if (nextRowCell) nextRowCell.focus();
}

// Supprimer le contenu de la cellule précédente et déplacer le curseur à cette cellule
function deleteAndMoveBack(x, y) {
    let prevX = x - 1;
    let prevY = y;

    if (prevX < 0) {
        prevX = gridWidth - 1;
        prevY -= 1;
    }

    // Focus sur la cellule précédente (x-1, y)
    const prevCell = document.querySelector(`.cell[data-x="${prevX}"][data-y="${prevY}"]`);
    if (prevCell) {
        prevCell.focus();  // Déplacer le focus sur la cellule précédente
        prevCell.innerText = ''; // Effacer la cellule
    }

    // Sauvegarder la grille après suppression
    updateGridData();
}

// Focus sur une cellule donnée
function focusCell(x, y) {
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    if (cell) {
        cell.focus();
    }
}

// Générer la grille
function generateGrid() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    gridWidth = Math.ceil(screenWidth / cellWidth);
    gridHeight = Math.ceil(screenHeight / cellHeight);

    gridElement.innerHTML = ''; // Réinitialiser la grille

    const savedGrid = loadFromLocalStorage(); // Charger les données sauvegardées

    // Créer la grille basée sur les données sauvegardées
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const value = savedGrid[y] && savedGrid[y][x] ? savedGrid[y][x] : '';
            const cell = createCell(x, y, value);
            gridElement.appendChild(cell);
        }
    }

    // Vérifier si c'est la première connexion (grille vide)
    if (savedGrid.length === 0 || savedGrid.every(row => row.every(cell => cell === ''))) {
        addWelcomeText(); // Ajouter le texte de bienvenue
    }
}

// Sauvegarder la grille actuelle dans le localStorage
function updateGridData() {
    const gridData = [];

    document.querySelectorAll('.cell').forEach(cell => {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const value = cell.innerText || '';
        if (!gridData[y]) gridData[y] = [];
        gridData[y][x] = value;
    });

    updateLocalStorage(gridData);
}

// Initialiser la grille
generateGrid();

// Réagir au redimensionnement de la fenêtre
window.addEventListener('resize', generateGrid);

// Ajouter une cellule au clic si elle n'existe pas déjà
document.addEventListener('click', (e) => {
    const gridRect = gridElement.getBoundingClientRect();
    const x = Math.floor((e.clientX - gridRect.left) / cellWidth);
    const y = Math.floor((e.clientY - gridRect.top) / cellHeight);

    let cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    if (!cell) {
        cell = createCell(x, y);
        gridElement.appendChild(cell);
    }

    cell.focus();
});
