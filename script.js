// Game State
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let isAIMode = false;
let scores = { X: 0, O: 0, draw: 0 };

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const pvpBtn = document.getElementById('pvpBtn');
const aiBtn = document.getElementById('aiBtn');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreDraw = document.getElementById('scoreDraw');
const boardElement = document.getElementById('board');

// Winning combinations
const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// Initialize game
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('touchend', handleCellClick, { passive: false });
    });

    restartBtn.addEventListener('click', restartGame);
    pvpBtn.addEventListener('click', () => setMode(false));
    aiBtn.addEventListener('click', () => setMode(true));
}

// Set game mode
function setMode(aiMode) {
    isAIMode = aiMode;
    pvpBtn.classList.toggle('active', !aiMode);
    aiBtn.classList.toggle('active', aiMode);
    restartGame();
}

// Handle cell click
function handleCellClick(e) {
    e.preventDefault();
    
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) {
        return;
    }

    // If AI mode and it's AI's turn, ignore clicks
    if (isAIMode && currentPlayer === 'O') {
        return;
    }

    makeMove(index, currentPlayer);
}

// Make a move
function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add('taken', player.toLowerCase());

    if (checkWin(player)) {
        gameActive = false;
        scores[player]++;
        updateScores();
        highlightWinningCells(player);
        statusDisplay.textContent = `${player} Wins!`;
        return;
    }

    if (board.every(cell => cell !== '')) {
        gameActive = false;
        scores.draw++;
        updateScores();
        statusDisplay.textContent = "It's a Draw!";
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = isAIMode && currentPlayer === 'O' 
        ? 'AI is thinking...' 
        : `Player ${currentPlayer}'s Turn`;

    // If AI mode and it's AI's turn, make AI move
    if (isAIMode && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

// Check for win
function checkWin(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

// Highlight winning cells
function highlightWinningCells(player) {
    winningCombinations.forEach(combination => {
        if (combination.every(index => board[index] === player)) {
            combination.forEach(index => {
                cells[index].classList.add('winner');
            });
        }
    });
}

// AI Move logic using Minimax algorithm
function makeAIMove() {
    if (!gameActive) return;

    boardElement.classList.add('thinking');

    // Small delay for better UX
    setTimeout(() => {
        boardElement.classList.remove('thinking');
        
        const bestMove = getBestMove();
        makeMove(bestMove, 'O');
    }, 500);
}

// Get the best move using Minimax
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = 0;

    // First move: take center if available (better strategy)
    if (board[4] === '') {
        return 4;
    }

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            const score = minimax(board, 0, false, -Infinity, Infinity);
            board[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, isMaximizing, alpha, beta) {
    // Check terminal states
    if (checkWinState('O')) return 10 - depth;
    if (checkWinState('X')) return depth - 10;
    if (board.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = '';
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = '';
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return minScore;
    }
}

// Check win state for a specific player (used in minimax)
function checkWinState(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

// Update score display
function updateScores() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

// Restart game
function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    statusDisplay.textContent = isAIMode ? 'Player X\'s Turn' : 'Player X\'s Turn';
}

// Start the game
init();

