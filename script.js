document.addEventListener("DOMContentLoaded", function() {
    // Game board IIFE
    const gameBoard = (() => {
        const BOARD_SIZE = 3;

        const board = Array.from({ length: BOARD_SIZE }, () =>
            Array.from({ length: BOARD_SIZE }, () => "")
        );

        return { board };
    })();

    // Player creation factory function
    function createPlayer(name, player, icon, human) {
        return { name, player, icon, human };
    }

    function createGame(board) {
        const BOARD_SIZE = gameBoard.board.length;
        let playerOneTurn = true;

        // Potententially move these into a start game function
        const playerOne = createPlayer("Player 1", 1, "X", true);
        const playerTwo = createPlayer("Player 2", 2, "O", true);

        const players = [playerOne.icon, playerTwo.icon];

        const promptUser = () => {
            let player;
            playerOneTurn ? player = playerOne.name : player = playerTwo.name;
            return parseInt(prompt(`${player}, choose a square:`)) - 1;
        }

        const playTurn = () => {
            while (true) {
                let chosenSquare = promptUser();

                let row = Math.floor(chosenSquare / BOARD_SIZE);
                let col = chosenSquare % BOARD_SIZE;

                if (gameBoard.board[row][col] === "") {
                    playerOneTurn ? gameBoard.board[row][col] = playerOne.icon : gameBoard.board[row][col] = playerTwo.icon;
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

        return { board, playerOne, playerTwo, playTurn, checkWinner, isTie, resetGame };
    }

    const game = createGame(gameBoard);

    while (!game.checkWinner()) {
        game.playTurn();

        gameBoard.board.forEach(row => {
            console.log(row);
        });

        console.log(`-------------------------`);

        if (game.isTie()) {
            console.log(`IT'S A TIE!`);
            break;
        }
    }

    if (game.checkWinner()) {
        console.log(`${game.checkWinner()} WINS`);
    }
});