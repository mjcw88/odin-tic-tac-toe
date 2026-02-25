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

        const renderBoard = () => {
            main.innerHTML = "";

            const gameBoardContainer = document.createElement("div");
            gameBoardContainer.className = "game-board-container";
            main.appendChild(gameBoardContainer);

            for (let i = 0; i < TOTAL_SQUARES; i++) {
                const div = document.createElement("div");
                div.className = "board-square";
                div.dataset.id = i + 1;
                div.textContent = i + 1; // PLACEHOLDER
                gameBoardContainer.appendChild(div);
            }
        };

        const renderNewGameForm = () => {
            closeBtn.hidden = true;
            newGameForm.showModal();
        };

        const renderPlayerDisplay = (playerOne, playerTwo) => {
            const playerDisplay = document.getElementById("player-display-container");
            playerDisplay.innerHTML = "";

            const playerOneDisplay = document.createElement("div");
            playerOneDisplay.textContent = `${playerOne.name}: ${playerOne.marker}`;

            const playerTwoDisplay = document.createElement("div");
            playerTwoDisplay.textContent = `${playerTwo.name}: ${playerTwo.marker}`;

            playerDisplay.append(playerOneDisplay, playerTwoDisplay);
        };

        const showCloseBtn = () => {
            closeBtn.hidden = false;
        };

        const closeNewGameForm = () => {
            newGameForm.close();
        };

        return { renderBoard, renderNewGameForm, renderPlayerDisplay, showCloseBtn, closeNewGameForm };
    })();

    // Player creation factory function
    function createPlayer(name, player, marker, human) {
        return { name, player, marker, human };
    }

    // Game creation factory function
    function createGame(board, playerOne, playerTwo) {
        const players = [playerOne.marker, playerTwo.marker];
        const BOARD_SIZE = gameBoard.board.length;
        let playerOneTurn = true;

        const playTurn = () => {
            while (true) {
                let row = Math.floor(chosenSquare / BOARD_SIZE);
                let col = chosenSquare % BOARD_SIZE;

                if (gameBoard.board[row][col] === "") {
                    playerOneTurn ? gameBoard.board[row][col] = playerOne.marker : gameBoard.board[row][col] = playerTwo.marker;
                    playerOneTurn = !playerOneTurn;
                    break;
                }
            }
        };

        const checkWinner = () => {
            // Checks rows
            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (gameBoard.board[j].every(row => row === players[i])) {
                        return players[i];
                    }
                }
            }

            // Checks columns
            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (gameBoard.board.every(row => row[j] === players[i])) {
                        return players[i];
                    }
                }
            }

            // Checks top left - bottom right diagonal
            const topLeftDiag = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
                topLeftDiag.push(gameBoard.board[i][i]);
            }

            for (let i = 0; i < players.length; i++) {
                if (topLeftDiag.every(row => row === players[i])) {
                    return players[i];
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
                if (topRightDiag.every(row => row === players[i])) {
                    return players[i];
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

        // TODO
        const restartGame = () => {
            gameBoard.board.forEach((row, rowIndex) => {
                row.forEach((_, colIndex) => {
                    gameBoard.board[rowIndex][colIndex] = "";
                });
            });
        };

        return { board, playerOneTurn, playTurn, checkWinner, isTie, restartGame };
    }

    // Game controller — owns all event listeners and bridges UI to game logic
    const gameController = (() => {
        const newGameForm = document.getElementById("new-game-form");
        const form = newGameForm.querySelector("form");
        const playerCountBtns = document.querySelectorAll('input[name="playerCount"]');
        const playerTwoNameTextBox = document.getElementById("player2-name");
        const closeBtn = document.getElementById("close-btn");
        const startGameBtn = document.getElementById("start-game-btn");
        const newGameBtn = document.getElementById("new-game-btn");
        const restartGameBtn = document.getElementById("restart-game-btn");

        let currentGame = null;

        const changePlayerCount = () => {
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

            let playerOneName;
            let playerTwoName;

            data.playerOneName === "" ? playerOneName = "Player 1" : playerOneName = data.playerOneName;
            data.playerTwoName === "" ? playerTwoName = "Player 2" : playerTwoName = data.playerTwoName;

            const playerOne = createPlayer(`${playerOneName}`, 1, "X", true);
            const playerTwo = playerCount === 1
                ? createPlayer("CPU", 2, "O", false)
                : createPlayer(`${playerTwoName}`, 2, "O", true);

            displayController.renderPlayerDisplay(playerOne, playerTwo);

            currentGame = createGame(gameBoard, playerOne, playerTwo);
            currentGame.restartGame();

            form.reset();
            newGameForm.close();
        };

        const restartGame = () => {
            if (currentGame) currentGame.restartGame();
        };

        const init = () => {
            playerCountBtns.forEach(btn => 
                btn.addEventListener("change", 
                    changePlayerCount
            ));

            startGameBtn.addEventListener("click", 
                startGame
            );

            newGameBtn.addEventListener("click", () => {
                displayController.renderNewGameForm();
                displayController.showCloseBtn();
            });

            closeBtn.addEventListener("click", () => {
                form.reset();
                displayController.closeNewGameForm();
            });

            restartGameBtn.addEventListener("click", 
                restartGame
            );
        };

        return { init };
    })();

    // Initialise
    displayController.renderBoard();
    displayController.renderNewGameForm();
    gameController.init();
});