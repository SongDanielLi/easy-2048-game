const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.querySelector('#score span');
const newGameButton = document.getElementById('new-game');
const highScoreDisplay = document.querySelector('#high-score span');
let highScore = 0;
let board = [];
let score = 0;

function initGame() {
    board = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    scoreDisplay.textContent = score;
	highScore = localStorage.getItem('highScore') || 0;
    highScoreDisplay.textContent = highScore;
    addNewTile();
    addNewTile();
    renderBoard();
}

function renderBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.textContent = board[i][j] || '';
            if (board[i][j]) {
                tile.style.backgroundColor = getTileColor(board[i][j]);
            }
            gameBoard.appendChild(tile);
        }
    }
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({i, j});
            }
        }
    }
    if (emptyTiles.length > 0) {
        const {i, j} = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
}

function move(direction) {
    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    if (direction === 'ArrowUp' || direction === 'ArrowDown') {
        for (let j = 0; j < 4; j++) {
            const column = [board[0][j], board[1][j], board[2][j], board[3][j]];
            const newColumn = moveLine(column, direction === 'ArrowUp');
            for (let i = 0; i < 4; i++) {
                if (newBoard[i][j] !== newColumn[i]) {
                    newBoard[i][j] = newColumn[i];
                    moved = true;
                }
            }
        }
    } else {
        for (let i = 0; i < 4; i++) {
            const newLine = moveLine(board[i], direction === 'ArrowLeft');
            if (newBoard[i].join(',') !== newLine.join(',')) {
                newBoard[i] = newLine;
                moved = true;
            }
        }
    }

    if (moved) {
        board = newBoard;
        addNewTile();
        renderBoard();
        scoreDisplay.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem('highScore', highScore);
        }
        if (isGameOver()) {
            alert('遊戲結束！');
        }
    }
}

function moveLine(line, moveTowardsStart) {
    let newLine = line.filter(tile => tile !== 0);
    
    if (!moveTowardsStart) {
        newLine.reverse();
    }
    
    for (let i = 0; i < newLine.length - 1; i++) {
        if (newLine[i] === newLine[i + 1]) {
            newLine[i] *= 2;
            score += newLine[i];
            newLine.splice(i + 1, 1);
        }
    }
    
    while (newLine.length < 4) {
        newLine.push(0);
    }
    
    if (!moveTowardsStart) {
        newLine.reverse();
    }
    
    return newLine;
}

function isGameOver() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) return false;
            if (i < 3 && board[i][j] === board[i + 1][j]) return false;
            if (j < 3 && board[i][j] === board[i][j + 1]) return false;
        }
    }
    return true;
}

function getTileColor(value) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        move(e.key);
    }
});



newGameButton.addEventListener('click', initGame);

initGame();

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault(); // 防止滾動
}

function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe();
}

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50; // 最小滑動距離

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑動
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                move('ArrowRight');
            } else {
                move('ArrowLeft');
            }
        }
    } else {
        // 垂直滑動
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                move('ArrowDown');
            } else {
                move('ArrowUp');
            }
        }
    }
}

// 添加觸摸事件監聽器
gameBoard.addEventListener('touchstart', handleTouchStart, false);
gameBoard.addEventListener('touchmove', handleTouchMove, false);
gameBoard.addEventListener('touchend', handleTouchEnd, false);