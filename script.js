document.addEventListener("DOMContentLoaded", function() {
    // Game board IIFE
    const gameBoard = (() => {
        const board = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""],
        ];
        return { board };
    })();
    
    // Player creation factory function
    function createPlayer(name, player, icon, human) {
        return { name, player, icon, human };
    }

    function createGame(board) {
        const playerOne = createPlayer("Player 1", 1, "X", true);
        const playerTwo = createPlayer("Player 2", 2, "O", true);

        const playRound = () => {
            console.log(board);
            const square = parseInt(prompt("Choose a square"));

            switch(square) {
                case 1:
                    // if player one turn
                    gameBoard.board[0][0] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[0][0] = playerTwo.icon;
                    break
                case 2:
                    // if player one turn
                    gameBoard.board[0][1] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[0][1] = playerTwo.icon;
                    break
                case 3:
                    // if player one turn
                    gameBoard.board[0][2] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[0][2] = playerTwo.icon;
                    break
                case 4:
                    // if player one turn
                    gameBoard.board[1][0] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[1][0] = playerTwo.icon;
                    break
                case 5:
                    // if player one turn
                    gameBoard.board[1][1] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[1][1] = playerTwo.icon;
                    break
                case 6:
                    // if player one turn
                    gameBoard.board[1][2] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[1][2] = playerTwo.icon;
                    break
                case 7:
                    // if player one turn
                    gameBoard.board[2][0] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[2][0] = playerTwo.icon;
                    break
                case 8:
                    // if player one turn
                    gameBoard.board[2][1] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[2][1] = playerTwo.icon;
                    break
                case 9:
                    // if player one turn
                    gameBoard.board[2][2] = playerOne.icon;
                    // if player two turn
                    // gameBoard.board[2][2] = playerTwo.icon;
                    break
            }
        }

        return { board, playerOne, playerTwo, playRound };
    }

    const game = createGame(gameBoard);

    game.playRound();

    // play game
        // player 1 selects tile
        // check if tile is available, if so assign it to player
        // check every row / column / diagonals for 3 in a row (player 1 wins)
        // check if there any blank tiles left (tie)
        
        // player 2 selects tile
        // check if tile is available, if so assign it to player
        // check every row / column / diagonals for 3 in a row (player 2 / cpu wins)
        // check if there any blank tiles left (tie)

        // repeat until winner
});