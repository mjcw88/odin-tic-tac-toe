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

        const gameBoardContainer = document.getElementById("game-board-container");
        const newGameForm = document.getElementById("new-game-form");
        const closeBtn = document.getElementById("close-btn");
        const playerDisplay = document.getElementById("player-display-container");
        const playerTurn = document.getElementById("player-turn-container");

        const renderBoard = () => {
            gameBoardContainer.innerHTML = "";

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
            playerDisplay.hidden = false;
            playerDisplay.innerHTML = "";

            const playerOneDisplay = document.createElement("div");
            playerOneDisplay.className = "player-one-display";
            const playerOneStrong = document.createElement("strong");
            playerOneStrong.textContent = playerOne.name;
            playerOneDisplay.appendChild(playerOneStrong);
            playerOneDisplay.append(`: ${playerOne.marker}`);

            const playerTwoDisplay = document.createElement("div");
            playerTwoDisplay.className = "player-two-display";
            const playerTwoStrong = document.createElement("strong");
            playerTwoStrong.textContent = playerTwo.name;
            playerTwoDisplay.appendChild(playerTwoStrong);
            playerTwoDisplay.append(`: ${playerTwo.marker}`);

            playerDisplay.append(playerOneDisplay, playerTwoDisplay);
        };

        const renderPlayersTurn = (player) => {
            playerTurn.hidden = false;

            player.player === 1 ? playerTurn.className = "player-one-turn" : playerTurn.className = "player-two-turn";
            playerTurn.innerHTML = "";

            const h1 = document.createElement("h1");
            h1.textContent = `${player.name}'s turn`;
            playerTurn.appendChild(h1);
        };

        const renderWinnerDisplay = (player) => {
            player[2] === 1 ? playerTurn.className = "player-one-turn" : playerTurn.className = "player-two-turn";
            playerTurn.innerHTML = "";

            const h1 = document.createElement("h1");
            h1.textContent = `${player[0]} wins!`;
            playerTurn.appendChild(h1);
        };

        const renderTieDisplay = () => {
            playerTurn.innerHTML = "";
            playerTurn.className = "game-tie";

            const h1 = document.createElement("h1");
            h1.textContent = `It's a tie!`;
            playerTurn.appendChild(h1);
        };

        const showCloseBtn = () => {
            closeBtn.hidden = false;
        };

        const closeNewGameForm = () => {
            newGameForm.close();
        };

        const updateBoard = (square, marker, markerSvg) => {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", markerSvg.width);
            svg.setAttribute("height", markerSvg.height);
            svg.setAttribute("viewBox", markerSvg.viewBox);

            if (markerSvg.gradient) {
                const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                const linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
                linearGradient.setAttribute("id", markerSvg.gradient.id);
                linearGradient.setAttribute("x1", markerSvg.gradient.x1);
                linearGradient.setAttribute("y1", markerSvg.gradient.y1);
                linearGradient.setAttribute("x2", markerSvg.gradient.x2);
                linearGradient.setAttribute("y2", markerSvg.gradient.y2);

                markerSvg.gradient.stops.forEach(s => {
                    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
                    stop.setAttribute("offset", s.offset);
                    stop.setAttribute("stop-color", s.color);
                    linearGradient.appendChild(stop);
                });

                defs.appendChild(linearGradient);
                svg.appendChild(defs);
            }

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", markerSvg.path);
            path.setAttribute("fill", markerSvg.fill);
            if (markerSvg.transform) path.setAttribute("transform", markerSvg.transform);
            svg.appendChild(path);

            square.className = `board-square player-marker-${marker.toLowerCase()}`;
            square.appendChild(svg);
        };

        const clearBoardDisplay = () => {
            document.querySelectorAll(".board-square").forEach(square => {
                square.className = "board-square";
                square.innerHTML = "";
            });
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

            data.playerOneName?.trim() === "" ? playerOneName = "Player 1" : playerOneName = data.playerOneName;
            data.playerTwoName?.trim() === "" ? playerTwoName = "Player 2" : playerTwoName = data.playerTwoName;

            const markerSvg = {
                cross: {
                    width: "800px",
                    height: "800px",
                    viewBox: "0 0 25 25",
                    fill: "url(#crossGradient)",
                    transform: "translate(-469, -1041)",
                    path: "M487.148,1053.48 L492.813,1047.82 C494.376,1046.26 494.376,1043.72 492.813,1042.16 C491.248,1040.59 488.712,1040.59 487.148,1042.16 L481.484,1047.82 L475.82,1042.16 C474.257,1040.59 471.721,1040.59 470.156,1042.16 C468.593,1043.72 468.593,1046.26 470.156,1047.82 L475.82,1053.48 L470.156,1059.15 C468.593,1060.71 468.593,1063.25 470.156,1064.81 C471.721,1066.38 474.257,1066.38 475.82,1064.81 L481.484,1059.15 L487.148,1064.81 C488.712,1066.38 491.248,1066.38 492.813,1064.81 C494.376,1063.25 494.376,1060.71 492.813,1059.15 L487.148,1053.48",
                    gradient: {
                        id: "crossGradient",
                        x1: "0%", y1: "0%", x2: "100%", y2: "100%",
                        stops: [
                            { offset: "0%", color: "#FF7676" },
                            { offset: "100%", color: "#F54EA2" },
                        ]
                    }
                },
                circle: {
                    width: "800px",
                    height: "800px",
                    viewBox: "0 0 32 32",
                    fill: "url(#circleGradient)",
                    transform: null,
                    path: "M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048z",
                    gradient: {
                        id: "circleGradient",
                        x1: "0%", y1: "0%", x2: "100%", y2: "100%",
                        stops: [
                            { offset: "0%", color: "#7676FF" },
                            { offset: "100%", color: "#A24EF5" },
                        ]
                    }
                },
            };

            playerOne = createPlayer(`${playerOneName}`, 1, "X", markerSvg.cross, true);
            playerTwo = playerCount === 1
                ? createPlayer("CPU", 2, "O", markerSvg.circle, false)
                : createPlayer(`${playerTwoName}`, 2, "O", markerSvg.circle, true);

            displayController.renderPlayerNames(playerOne, playerTwo);
            displayController.renderPlayersTurn(playerOne);
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
                if (!currentGame.gameOver && currentGame.cpuTurn) return;
                
                currentGame.winner = null;
                currentGame.gameOver = false;
                currentGame.cpuTurn = false;
                currentGame.restartGame();
                displayController.renderPlayersTurn(playerOne);
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
                        const WAIT_TIME = 500;
                        setTimeout(() => {
                            currentGame.playCpuTurn();
                            checkGameStatus();
                            currentGame.cpuTurn = false;
                        }, WAIT_TIME);
                    }
                }
            ));

            function checkGameStatus() {
                const winner = currentGame.checkWinner();
                
                if (winner) {
                    currentGame.winner = winner[0];
                    displayController.renderWinnerDisplay(winner);
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
    function createPlayer(name, player, marker, markerSvg, human) {
        return { name, player, marker, markerSvg, human };
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
            [playerOne.name, playerOne.marker, playerOne.player], 
            [playerTwo.name, playerTwo.marker, playerTwo.player]
        ];

        let playerOneTurn = true;
        let cpuTurn = false;
        let winner = null;
        let gameOver = false;

        const playHumanTurn = (chosenSquare, position) => {
            const square = position.squareNum;
            const row = position.row;
            const col = position.col;

            let player, marker, svg;

            if (playerOneTurn) {
                gameBoard.board[row][col] = playerOne.marker;
                player = playerTwo;
                marker = playerOne.marker;
                svg = playerOne.markerSvg;
            } else if (playerTwo.human) {
                gameBoard.board[row][col] = playerTwo.marker;
                player = playerOne;
                marker = playerTwo.marker;
                svg = playerTwo.markerSvg;
            }
            
            updateAvailbleSquare(square);

            playerOneTurn = !playerOneTurn;
            displayController.updateBoard(chosenSquare, marker, svg);
            displayController.renderPlayersTurn(player);
        };

        const playCpuTurn = () => {
            const cpuChoice = availableSquares[Math.floor(Math.random() * availableSquares.length)];
            const index = cpuChoice - 1
            const cpuChosenSquare = document.querySelector(`.board-square[data-id="${cpuChoice}"]`);

            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;

            gameBoard.board[row][col] = playerTwo.marker;
            const marker = playerTwo.marker;
            const svg = playerTwo.markerSvg;

            updateAvailbleSquare(cpuChoice);

            playerOneTurn = !playerOneTurn;
            displayController.updateBoard(cpuChosenSquare, marker, svg);
            displayController.renderPlayersTurn(playerOne);
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
                        return players[i]
                    }
                }
            }

            // Checks columns
            for (let i = 0; i < players.length; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (gameBoard.board.every(row => row[j] === players[i][1])) {
                        return players[i]
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
                    return players[i]
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
                    return players[i]
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
