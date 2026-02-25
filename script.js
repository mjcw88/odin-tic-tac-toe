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
        const renderBoard = () => { 
            const main = document.getElementById("main");
            const TOTAL_SQUARES = gameBoard.board.length * gameBoard.board.length;

            for (let i = 0; i < TOTAL_SQUARES; i++) {
                const div = document.createElement("div");
                div.className = "board-square";
                div.dataset.id = i + 1;
                div.textContent = i + 1; // PLACEHOLDER
                main.appendChild(div);
            }
         };

        return { renderBoard }
    })();

    // Player creation factory function
    function createPlayer(name, player, marker, human) {
        return { name, player, marker, human };
    }

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
        }

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
            const topLeftDiag = []
            for (let i = 0; i < BOARD_SIZE; i++) {
                topLeftDiag.push(gameBoard.board[i][i]);
            }

            for (let i = 0; i < players.length; i++) {
                if (topLeftDiag.every(row => row === players[i])) {
                    return players[i];
                }
            }

            // Checks top right - bottom left diagonal
            const topRightDiag = []
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
        }

        const isTie = () => {
            if (gameBoard.board.every(row => row.every(cell => cell !== ""))) {
                return true;
            }
            return false;
        }

        // TODO
        const resetGame = () => {
            gameBoard.board.forEach((row, rowIndex) => {
                row.forEach((_, colIndex) => {
                    gameBoard.board[rowIndex][colIndex] = "";
                });
            });
        }

        return { board, playerOneTurn, playTurn, checkWinner, isTie, resetGame };
    }

    displayController.renderBoard();

    document.getElementById("new-game-form").showModal();

    document.querySelectorAll('input[name="playerCount"]').forEach(btn => {
        btn.addEventListener("change", () => {
            if (document.querySelector('input[name="playerCount"]:checked').value === "1") {
                document.getElementById("player2-name").disabled = true;
            } else {
                document.getElementById("player2-name").disabled = false;
            }
        })
    });

    document.getElementById("start-game-btn").addEventListener("click", (e) => {
        e.preventDefault();

        const form = this.querySelector("form");
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
        let playerTwo;
        playerCount === 1 ? playerTwo = createPlayer("CPU", 2, "O", false) : playerTwo = createPlayer(`${playerTwoName}`, 2, "O", true);
    
        const game = createGame(gameBoard, playerOne, playerTwo);

        form.reset();
        document.getElementById("new-game-form").close();

        while (!game.checkWinner()) {
            game.playTurn();

            if (game.isTie()) {
                console.log(`IT'S A TIE!`);
                break;
            }
        }

        if (game.checkWinner()) {
            console.log(`${game.checkWinner()} WINS`);
        }
    });
});