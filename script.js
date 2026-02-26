document.addEventListener("DOMContentLoaded", function() {
    // Game board object IIFE
    const gameBoard = (() => {
        const BOARD_SIZE = 3;

        const board = Array.from({ length: BOARD_SIZE }, () =>
            Array.from({ length: BOARD_SIZE }, () => "")
        );

        return { board };
    })();

    // Display controller object IIFE
    const displayController = (() => {
        const TOTAL_SQUARES = gameBoard.board.length * gameBoard.board.length;
        const main = document.getElementById("main");
        const newGameForm = document.getElementById("new-game-form");
        const closeBtn = document.getElementById("close-btn");
        const playerDisplay = document.getElementById("player-display-container");
        const playerTurn = document.getElementById("player-turn-container");

        const renderBoard = () => {
            main.innerHTML = "";

            const gameBoardContainer = document.createElement("div");
            gameBoardContainer.className = "game-board-container";
            main.appendChild(gameBoardContainer);

            for (let i = 0; i < TOTAL_SQUARES; i++) {
                const div = document.createElement("div");
                div.className = "board-square";
                div.dataset.id = i + 1;
                gameBoardContainer.appendChild(div);
            }
        };

        const renderNewGameForm = () => {
            closeBtn.hidden = true;
            newGameForm.showModal();
        };

        const renderPlayerNames = (playerOne, playerTwo) => {
            playerTurn.innerHTML = "";

            const playerOneDisplay = document.createElement("div");
            playerOneDisplay.textContent = `${playerOne.name}: ${playerOne.marker}`;

            const playerTwoDisplay = document.createElement("div");
            playerTwoDisplay.textContent = `${playerTwo.name}: ${playerTwo.marker}`;

            playerTurn.append(playerOneDisplay, playerTwoDisplay);
        };

        const renderPlayersTurn = (player) => {
            playerDisplay.innerHTML = "";

            const h1 = document.createElement("h1");
            h1.textContent = `${player}'s turn`;
            playerDisplay.appendChild(h1);
        };

        const renderWinnerDisplay = (player) => {
            playerDisplay.innerHTML = "";

            const h1 = document.createElement("h1");
            h1.textContent = `${player} wins!`;
            playerDisplay.appendChild(h1);
        };

        const renderTieDisplay = () => {
            playerDisplay.innerHTML = "";

            const h1 = document.createElement("h1");
            h1.textContent = `It's a tie!`;
            playerDisplay.appendChild(h1);
        };

        const showCloseBtn = () => {
            closeBtn.hidden = false;
        };

        const closeNewGameForm = () => {
            newGameForm.close();
        };

        const updateBoard = (square, marker) => {
            square.textContent = marker;
        };

        const clearBoardDisplay = () => {
            document.querySelectorAll(".board-square").forEach(square =>
                square.innerHTML = ""
            );
        };

        return { renderBoard, renderNewGameForm, renderPlayerNames, renderPlayersTurn, renderWinnerDisplay, renderTieDisplay, showCloseBtn, closeNewGameForm, updateBoard, clearBoardDisplay };
    })();

    // Game controller object IIFE — owns all event listeners and bridges UI to game logic
    const gameController = (() => {
        const newGameForm = document.getElementById("new-game-form");
        const form = newGameForm.querySelector("form");
        const playerCountBtns = document.querySelectorAll('input[name="playerCount"]');
        const playerTwoNameTextBox = document.getElementById("player2-name");
        const closeBtn = document.getElementById("close-btn");
        const startGameBtn = document.getElementById("start-game-btn");
        const newGameBtn = document.getElementById("new-game-btn");
        const restartBoardBtn = document.getElementById("restart-game-btn");

        let currentGame = null;
        let playerOne, playerTwo, playerOneName, playerTwoName;

        const checkPlayerCount = () => {
            if (document.querySelector('input[name="playerCount"]:checked').value === "1") {
                playerTwoNameTextBox.disabled = true;
            } else {
                playerTwoNameTextBox.disabled = false;
            }
        };

        const startGame = (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const playerCount = parseInt(data.playerCount);

            data.playerOneName === "" ? playerOneName = "Player 1" : playerOneName = data.playerOneName;
            data.playerTwoName === "" ? playerTwoName = "Player 2" : playerTwoName = data.playerTwoName;

            playerOne = createPlayer(`${playerOneName}`, 1, "X", true);
            playerTwo = playerCount === 1
                ? createPlayer("CPU", 2, "O", false)
                : createPlayer(`${playerTwoName}`, 2, "O", true);

            displayController.renderPlayerNames(playerOne, playerTwo);
            displayController.renderPlayersTurn(playerOneName);
            displayController.clearBoardDisplay();
            restartBoard();

            currentGame = createGame(gameBoard, playerOne, playerTwo);

            form.reset();
            newGameForm.close();
        };

        const restartBoard = () => {
            if (currentGame) {
                gameBoard.board.forEach((row, rowIndex) => {
                    row.forEach((_, colIndex) => {
                        gameBoard.board[rowIndex][colIndex] = "";
                    });
                });

            };
        };

        const init = () => {
            playerCountBtns.forEach(btn => 
                btn.addEventListener("change", 
                    checkPlayerCount
            ));

            startGameBtn.addEventListener("click", 
                startGame
            );

            newGameBtn.addEventListener("click", () => {
                displayController.renderNewGameForm();
                displayController.showCloseBtn();
                checkPlayerCount();
            });

            closeBtn.addEventListener("click", () => {
                form.reset();
                displayController.closeNewGameForm();
            });

            restartBoardBtn.addEventListener("click", () => {
                currentGame.winner = null;
                currentGame.gameOver = false;
                currentGame.cpuTurn = false;
                currentGame.restartGame();
                displayController.renderPlayersTurn(playerOneName);
                displayController.clearBoardDisplay()
                restartBoard();
            });

            document.querySelectorAll(".board-square").forEach(square =>
                square.addEventListener("click", () => {
                    const position = currentGame.isSquareAvailable(square);
                    if (!position) return;
                    if (currentGame.gameOver) return;
                    if (currentGame.cpuTurn) return;

                    if (!playerTwo.human) {
                        currentGame.cpuTurn = true;
                    }
                    
                    currentGame.playHumanTurn(square, position);
                    checkGameStatus();

                    if (!currentGame.gameOver && !playerTwo.human) {
                        const WAIT_TIME = 1000;
                        setTimeout(() => {
                            currentGame.playCpuTurn();
                            checkGameStatus();
                            currentGame.cpuTurn = false;
                        }, WAIT_TIME);
                    }
                }
            ));

            function checkGameStatus() {
                currentGame.winner = currentGame.checkWinner();
                
                if (currentGame.winner) {
                    displayController.renderWinnerDisplay(currentGame.winner);
                    currentGame.gameOver = true;
                }

                if (!currentGame.winner && currentGame.isTie()) {
                    displayController.renderTieDisplay();
                    currentGame.gameOver = true;
                }
            };
        };

        return { init };
    })();

    // Player creation factory function
    function createPlayer(name, player, marker, human) {
        return { name, player, marker, human };
    }

    // Game creation factory function
    function createGame(board, playerOne, playerTwo) {
        const BOARD_SIZE = gameBoard.board.length
        const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

        const availableSquares = [];

        for (let i = 0; i < TOTAL_SQUARES; i++) {
            availableSquares.push(i + 1);
        };

        const players = [
            [playerOne.name, playerOne.marker], 
            [playerTwo.name, playerTwo.marker]
        ];

        let playerOneTurn = true;
        let cpuTurn = false;
        let winner = null;
        let gameOver = false;

        const playHumanTurn = (chosenSquare, position) => {
            const square = position.squareNum;
            const row = position.row;
            const col = position.col;

            let player, marker;

            if (playerOneTurn) {
                gameBoard.board[row][col] = playerOne.marker;
                player = playerTwo.name;
                marker = playerOne.marker;
            } else if (playerTwo.human) {
                gameBoard.board[row][col] = playerTwo.marker;
                player = playerOne.name;
                marker = playerTwo.marker;
            }
            
            updateAvailbleSquare(square);

            playerOneTurn = !playerOneTurn;
            displayController.updateBoard(chosenSquare, marker);
            displayController.renderPlayersTurn(player);
        };

        const playCpuTurn = () => {
            const cpuChoice = availableSquares[Math.floor(Math.random() * availableSquares.length)];
            const index = cpuChoice - 1
            const cpuChosenSquare = document.querySelector(`.board-square[data-id="${cpuChoice}"]`);

            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;

            gameBoard.board[row][col] = playerTwo.marker;
            const player = playerOne.name;
            const marker = playerTwo.marker;

            updateAvailbleSquare(cpuChoice);

            playerOneTurn = !playerOneTurn;
            displayController.updateBoard(cpuChosenSquare, marker);
            displayController.renderPlayersTurn(player);
        };

        const isSquareAvailable = (square) => {
            const squareNum = parseInt(square.dataset.id);
            const index = squareNum - 1;
            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;

            if (gameBoard.board[row][col] === "") {
                return { squareNum, row, col };
            }
            return null;
        };

        const updateAvailbleSquare = (num) => {
            const squareIndex = availableSquares.indexOf(num);
            availableSquares.splice(squareIndex, 1);
        }

        const checkWinner = () => {
            // Checks rows
            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (gameBoard.board[j].every(row => row === players[i][1])) {
                        return players[i][0]
                    }
                }
            }

            // Checks columns
            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (gameBoard.board.every(row => row[j] === players[i][1])) {
                        return players[i][0]
                    }
                }
            }

            // Checks top left - bottom right diagonal
            const topLeftDiag = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
                topLeftDiag.push(gameBoard.board[i][i]);
            }

            for (let i = 0; i < players.length; i++) {
                if (topLeftDiag.every(row => row === players[i][1])) {
                    return players[i][0]
                }
            }

            // Checks top right - bottom left diagonal
            const topRightDiag = [];
            let j = BOARD_SIZE - 1;
            for (let i = 0; i < BOARD_SIZE; i++) {
                topRightDiag.push(gameBoard.board[i][j]);
                j--;
            }

            for (let i = 0; i < players.length; i++) {
                if (topRightDiag.every(row => row === players[i][1])) {
                    return players[i][0]
                }
            }

            return null;
        };

        const isTie = () => {
            if (gameBoard.board.every(row => row.every(cell => cell !== ""))) {
                return true;
            }
            
            return false;
        };

        const restartGame = () => {
            playerOneTurn = true;
            
            availableSquares.length = 0;
            for (let i = 0; i < TOTAL_SQUARES; i++) {
                availableSquares.push(i + 1);
            };
        };

        return { board, cpuTurn, winner, gameOver, playHumanTurn, playCpuTurn, isSquareAvailable, checkWinner, isTie, restartGame };
    }

    // Initialise
    displayController.renderBoard();
    displayController.renderNewGameForm();
    gameController.init();
});