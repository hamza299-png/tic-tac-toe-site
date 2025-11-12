// Game State
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameMode = 'pvp'; // 'pvp' or 'ai'
        let gameActive = true;
        let scores = { X: 0, O: 0, draw: 0 };

        // DOM Elements
        const cells = document.querySelectorAll('.cell');
        const gameStatus = document.getElementById('gameStatus');
        const resetBtn = document.getElementById('resetBtn');
        const modeBtns = document.querySelectorAll('.mode-btn');
        const themeToggle = document.getElementById('themeToggle');
        const player2Label = document.getElementById('player2Label');

        // Winning combinations
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        // Initialize game
        function init() {
            cells.forEach(cell => {
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('keypress', handleKeyPress);
            });
            
            resetBtn.addEventListener('click', resetGame);
            
            modeBtns.forEach(btn => {
                btn.addEventListener('click', switchMode);
            });

            themeToggle.addEventListener('click', toggleTheme);
            
            // Load saved theme
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        // Handle cell click
        function handleCellClick(e) {
            const index = e.target.dataset.index;
            if (board[index] !== '' || !gameActive) return;
            
            makeMove(index, currentPlayer);
            
            // AI move if in AI mode and game is still active
            if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
                setTimeout(() => {
                    if (gameActive) aiMove();
                }, 500);
            }
        }

        // Handle keyboard navigation
        function handleKeyPress(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCellClick(e);
            }
        }

        // Make a move
        function makeMove(index, player) {
            board[index] = player;
            const cell = cells[index];
            cell.textContent = player;
            cell.classList.add('filled', player.toLowerCase());
            
            if (checkWin(player)) {
                endGame(`${player === 'X' ? 'Player X' : (gameMode === 'ai' ? 'Computer' : 'Player O')} Wins!`, player);
                scores[player]++;
                updateScoreboard();
            } else if (board.every(cell => cell !== '')) {
                endGame("It's a Draw!", 'draw');
                scores.draw++;
                updateScoreboard();
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updateStatus();
            }
        }

        // Check for win
        function checkWin(player) {
            return winPatterns.some(pattern => {
                const win = pattern.every(index => board[index] === player);
                if (win) {
                    pattern.forEach(index => cells[index].classList.add('winning'));
                }
                return win;
            });
        }

        // End game
        function endGame(message, winner) {
            gameActive = false;
            gameStatus.textContent = message;
            
            if (winner === 'X') {
                gameStatus.className = 'game-status win';
            } else if (winner === 'O') {
                gameStatus.className = gameMode === 'ai' ? 'game-status lose' : 'game-status win';
            } else {
                gameStatus.className = 'game-status';
            }
            
            cells.forEach(cell => cell.style.cursor = 'not-allowed');
        }

        // Update game status
        function updateStatus() {
            if (gameActive) {
                const playerName = currentPlayer === 'X' ? 'Player X' : (gameMode === 'ai' ? 'Computer' : 'Player O');
                gameStatus.textContent = `${playerName}'s Turn`;
                gameStatus.className = 'game-status';
            }
        }

        // Reset game
        function resetGame() {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;
            
            cells.forEach(cell => {
                cell.textContent = '';
                cell.className = 'cell';
                cell.style.cursor = 'pointer';
            });
            
            updateStatus();
        }

        // Switch game mode
        function switchMode(e) {
            modeBtns.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            gameMode = e.target.dataset.mode;
            
            player2Label.textContent = gameMode === 'ai' ? 'Computer' : 'Player O';
            resetGame();
            scores = { X: 0, O: 0, draw: 0 };
            updateScoreboard();
        }

        // Update scoreboard
        function updateScoreboard() {
            document.getElementById('scoreX').textContent = scores.X;
            document.getElementById('scoreO').textContent = scores.O;
            document.getElementById('scoreDraw').textContent = scores.draw;
        }

        // AI Move with strategy
        function aiMove() {
            // Try to win
            let move = findBestMove('O');
            if (move !== -1) {
                makeMove(move, 'O');
                return;
            }
            
            // Block player from winning
            move = findBestMove('X');
            if (move !== -1) {
                makeMove(move, 'O');
                return;
            }
            
            // Take center if available
            if (board[4] === '') {
                makeMove(4, 'O');
                return;
            }
            
            // Take a corner
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(i => board[i] === '');
            if (availableCorners.length > 0) {
                const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                makeMove(randomCorner, 'O');
                return;
            }
            
            // Take any available space
            const availableMoves = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
            if (availableMoves.length > 0) {
                const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                makeMove(randomMove, 'O');
            }
        }

        // Find best move for a player
        function findBestMove(player) {
            for (let pattern of winPatterns) {
                const values = pattern.map(i => board[i]);
                const playerCount = values.filter(v => v === player).length;
                const emptyCount = values.filter(v => v === '').length;
                
                if (playerCount === 2 && emptyCount === 1) {
                    return pattern[values.indexOf('')];
                }
            }
            return -1;
        }

        // Toggle theme
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        }

        // Update theme icon
        function updateThemeIcon(theme) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        // Initialize on load
        init();
