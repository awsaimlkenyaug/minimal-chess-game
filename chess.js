/**
 * Minimal Chess Game
 * A simple implementation of chess with basic rules and UI
 * Includes AI opponent with multiple difficulty levels
 */

// Chess piece Unicode symbols
const PIECES = {
    'white': {
        'king': '♔',
        'queen': '♕',
        'rook': '♖',
        'bishop': '♗',
        'knight': '♘',
        'pawn': '♙'
    },
    'black': {
        'king': '♚',
        'queen': '♛',
        'rook': '♜',
        'bishop': '♝',
        'knight': '♞',
        'pawn': '♟'
    }
};

/**
 * Chess game class
 * Handles game state and logic
 */
class ChessGame {
    /**
     * Initialize a new chess game
     */
    constructor() {
        this.board = this.createBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameOver = false;
        this.moveHistory = [];
        
        // Game mode settings
        this.gameMode = 'computer'; // 'human' or 'computer'
        this.difficulty = 'medium'; // 'easy', 'medium', or 'hard'
        this.playerColor = 'white'; // 'white' or 'black'
        
        // Initialize AI
        this.ai = new ChessAI(this.difficulty);
        
        this.setupEventListeners();
        this.renderBoard();
        
        // If player is black, let AI make the first move
        if (this.gameMode === 'computer' && this.playerColor === 'black') {
            this.makeAIMove();
        }
    }

    /**
     * Create the initial chess board setup
     * @returns {Array} 2D array representing the chess board
     */
    createBoard() {
        // Initialize empty 8x8 board
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Set up pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Set up other pieces
        const backRowPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: backRowPieces[i], color: 'black' };
            board[7][i] = { type: backRowPieces[i], color: 'white' };
        }
        
        return board;
    }

    /**
     * Set up event listeners for the game
     */
    setupEventListeners() {
        // Game controls
        document.getElementById('reset').addEventListener('click', () => this.resetGame());
        document.getElementById('undo').addEventListener('click', () => this.undoMove());
        
        // Game settings
        document.getElementById('game-mode').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.resetGame();
        });
        
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.ai.setDifficulty(this.difficulty);
        });
        
        document.getElementById('player-color').addEventListener('change', (e) => {
            this.playerColor = e.target.value;
            this.resetGame();
        });
    }

    /**
     * Reset the game to initial state
     */
    resetGame() {
        this.board = this.createBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.gameOver = false;
        this.moveHistory = [];
        
        document.getElementById('undo').disabled = true;
        
        this.updateStatus(`${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s turn`);
        this.renderBoard();
        
        // If player is black, let AI make the first move
        if (this.gameMode === 'computer' && this.playerColor === 'black') {
            this.makeAIMove();
        }
    }

    /**
     * Render the chess board on the page
     */
    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        // Determine board orientation based on player color
        const isFlipped = this.playerColor === 'black';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // Adjust coordinates if board is flipped
                const displayRow = isFlipped ? 7 - row : row;
                const displayCol = isFlipped ? 7 - col : col;
                
                const square = document.createElement('div');
                square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add piece if exists
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = PIECES[piece.color][piece.type];
                    square.dataset.piece = `${piece.color}-${piece.type}`;
                }
                
                // Add click event
                square.addEventListener('click', (e) => this.handleSquareClick(row, col));
                
                // Highlight last move
                if (this.moveHistory.length > 0) {
                    const lastMove = this.moveHistory[this.moveHistory.length - 1];
                    if ((row === lastMove.fromRow && col === lastMove.fromCol) || 
                        (row === lastMove.toRow && col === lastMove.toCol)) {
                        square.classList.add('last-move');
                    }
                }
                
                boardElement.appendChild(square);
            }
        }
    }

    /**
     * Handle click on a chess square
     * @param {number} row - Row index of clicked square
     * @param {number} col - Column index of clicked square
     */
    handleSquareClick(row, col) {
        // Ignore clicks if game is over or if it's AI's turn
        if (this.gameOver || (this.gameMode === 'computer' && this.currentPlayer !== this.playerColor)) {
            return;
        }
        
        const piece = this.board[row][col];
        
        // If no piece is selected and clicked on own piece, select it
        if (!this.selectedPiece && piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col, piece };
            this.highlightValidMoves(row, col);
            return;
        }
        
        // If piece is already selected
        if (this.selectedPiece) {
            // If clicking on the same piece, deselect it
            if (row === this.selectedPiece.row && col === this.selectedPiece.col) {
                this.selectedPiece = null;
                this.removeHighlights();
                return;
            }
            
            // If clicking on a valid move square, move the piece
            if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                this.removeHighlights();
                
                // If playing against AI, make AI move
                if (this.gameMode === 'computer' && !this.gameOver) {
                    setTimeout(() => this.makeAIMove(), 500);
                }
                
                return;
            }
            
            // If clicking on another of own pieces, select that instead
            if (piece && piece.color === this.currentPlayer) {
                this.selectedPiece = { row, col, piece };
                this.removeHighlights();
                this.highlightValidMoves(row, col);
                return;
            }
            
            // If clicking elsewhere, deselect
            this.selectedPiece = null;
            this.removeHighlights();
        }
    }

    /**
     * Make a move for the AI
     */
    makeAIMove() {
        document.getElementById('thinking').classList.remove('hidden');
        
        // Use setTimeout to allow UI to update before AI calculation
        setTimeout(() => {
            const aiColor = this.playerColor === 'white' ? 'black' : 'white';
            const move = this.ai.getBestMove(this, aiColor);
            
            if (move) {
                this.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol);
            } else {
                // No valid moves - game should be over
                if (!this.gameOver) {
                    this.gameOver = true;
                    this.updateStatus('Game over: Stalemate');
                }
            }
            
            document.getElementById('thinking').classList.add('hidden');
        }, 100);
    }

    /**
     * Undo the last move (or last two moves in computer mode)
     */
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        // In computer mode, undo both player's and AI's moves
        const movesToUndo = this.gameMode === 'computer' ? 2 : 1;
        
        for (let i = 0; i < movesToUndo; i++) {
            if (this.moveHistory.length === 0) break;
            
            const lastMove = this.moveHistory.pop();
            
            // Restore the moved piece
            this.board[lastMove.fromRow][lastMove.fromCol] = lastMove.piece;
            
            // Restore the captured piece (if any)
            this.board[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece;
            
            // Switch back to previous player
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        }
        
        // Reset game state
        this.gameOver = false;
        this.selectedPiece = null;
        
        // Update UI
        this.updateStatus(`${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s turn`);
        this.renderBoard();
        
        // Disable undo button if no more moves
        document.getElementById('undo').disabled = this.moveHistory.length === 0;
    }

    /**
     * Highlight valid moves for a selected piece
     * @param {number} row - Row index of selected piece
     * @param {number} col - Column index of selected piece
     */
    highlightValidMoves(row, col) {
        this.removeHighlights();
        
        // Highlight the selected piece
        const selectedSquare = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        selectedSquare.classList.add('highlight');
        
        // Highlight valid moves
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    // Check if move would leave king in check
                    const piece = this.board[row][col];
                    const originalTarget = this.board[r][c];
                    
                    // Try the move
                    this.board[r][c] = piece;
                    this.board[row][col] = null;
                    
                    const kingInCheck = this.isKingInCheck(piece.color);
                    
                    // Undo the move
                    this.board[row][col] = piece;
                    this.board[r][c] = originalTarget;
                    
                    // Only highlight legal moves that don't leave king in check
                    if (!kingInCheck) {
                        const square = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                        square.classList.add('highlight');
                    }
                }
            }
        }
    }

    /**
     * Remove all highlights from the board
     */
    removeHighlights() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('highlight');
            square.classList.remove('check');
        });
    }

    /**
     * Check if a move is valid
     * @param {number} fromRow - Starting row
     * @param {number} fromCol - Starting column
     * @param {number} toRow - Target row
     * @param {number} toCol - Target column
     * @returns {boolean} Whether the move is valid
     */
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        // Can't move to a square with own piece
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        // Check specific piece movement rules
        switch (piece.type) {
            case 'pawn':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol);
            case 'rook':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case 'bishop':
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case 'king':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    /**
     * Check if a pawn move is valid
     */
    isValidPawnMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const direction = piece.color === 'white' ? -1 : 1;
        
        // Moving forward one square
        if (fromCol === toCol && toRow === fromRow + direction && !this.board[toRow][toCol]) {
            return true;
        }
        
        // Moving forward two squares from starting position
        const startRow = piece.color === 'white' ? 6 : 1;
        if (fromCol === toCol && fromRow === startRow && toRow === fromRow + 2 * direction && 
            !this.board[fromRow + direction][fromCol] && !this.board[toRow][toCol]) {
            return true;
        }
        
        // Capturing diagonally
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && 
            this.board[toRow][toCol] && this.board[toRow][toCol].color !== piece.color) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if a rook move is valid
     */
    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        // Rook moves horizontally or vertically
        if (fromRow !== toRow && fromCol !== toCol) return false;
        
        // Check if path is clear
        if (fromRow === toRow) {
            // Horizontal move
            const start = Math.min(fromCol, toCol);
            const end = Math.max(fromCol, toCol);
            for (let c = start + 1; c < end; c++) {
                if (this.board[fromRow][c]) return false;
            }
        } else {
            // Vertical move
            const start = Math.min(fromRow, toRow);
            const end = Math.max(fromRow, toRow);
            for (let r = start + 1; r < end; r++) {
                if (this.board[r][fromCol]) return false;
            }
        }
        
        return true;
    }

    /**
     * Check if a knight move is valid
     */
    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        // Knight moves in L-shape: 2 squares in one direction and 1 in perpendicular
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    /**
     * Check if a bishop move is valid
     */
    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        // Bishop moves diagonally
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        if (rowDiff !== colDiff) return false;
        
        // Check if path is clear
        const rowDirection = toRow > fromRow ? 1 : -1;
        const colDirection = toCol > fromCol ? 1 : -1;
        
        for (let i = 1; i < rowDiff; i++) {
            if (this.board[fromRow + i * rowDirection][fromCol + i * colDirection]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if a queen move is valid
     */
    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        // Queen can move like a rook or bishop
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    /**
     * Check if a king move is valid
     */
    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        // King moves one square in any direction
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        
        return rowDiff <= 1 && colDiff <= 1;
    }

    /**
     * Move a piece on the board
     * @param {number} fromRow - Starting row
     * @param {number} fromCol - Starting column
     * @param {number} toRow - Target row
     * @param {number} toCol - Target column
     */
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Save move to history
        this.moveHistory.push({
            fromRow,
            fromCol,
            toRow,
            toCol,
            piece: { ...piece },
            capturedPiece: capturedPiece ? { ...capturedPiece } : null
        });
        
        // Enable undo button
        document.getElementById('undo').disabled = false;
        
        // Handle pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            piece.type = 'queen'; // Auto-promote to queen for simplicity
        }
        
        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Check for check/checkmate
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        const isCheck = this.isKingInCheck(this.currentPlayer);
        const isCheckmate = isCheck && this.isCheckmate(this.currentPlayer);
        
        // Update game state
        if (isCheckmate) {
            this.gameOver = true;
            const winner = this.currentPlayer === 'white' ? 'Black' : 'White';
            this.updateStatus(`Checkmate! ${winner} wins!`);
        } else if (isCheck) {
            this.updateStatus(`Check! ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s turn`);
        } else {
            this.updateStatus(`${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s turn`);
        }
        
        // Highlight king if in check
        if (isCheck) {
            this.highlightCheck(this.currentPlayer);
        }
        
        // Re-render the board
        this.renderBoard();
    }

    /**
     * Get the opponent's color
     * @returns {string} Opponent's color ('white' or 'black')
     */
    getOpponentColor() {
        return this.currentPlayer === 'white' ? 'black' : 'white';
    }

    /**
     * Check if a king is in check
     * @param {string} color - Color of the king to check
     * @returns {boolean} Whether the king is in check
     */
    isKingInCheck(color) {
        // Find the king's position
        let kingRow = -1;
        let kingCol = -1;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
            if (kingRow !== -1) break;
        }
        
        // Check if any opponent piece can capture the king
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    if (this.isValidMove(row, col, kingRow, kingCol)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Check if a player is in checkmate
     * @param {string} color - Color of the player to check
     * @returns {boolean} Whether the player is in checkmate
     */
    isCheckmate(color) {
        // If not in check, can't be checkmate
        if (!this.isKingInCheck(color)) return false;
        
        // Check if any move can get out of check
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                // Try the move
                                const originalTarget = this.board[toRow][toCol];
                                this.board[toRow][toCol] = piece;
                                this.board[fromRow][fromCol] = null;
                                
                                // Check if still in check
                                const stillInCheck = this.isKingInCheck(color);
                                
                                // Undo the move
                                this.board[fromRow][fromCol] = piece;
                                this.board[toRow][toCol] = originalTarget;
                                
                                if (!stillInCheck) {
                                    return false; // Found a move that escapes check
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return true; // No move escapes check
    }

    /**
     * Highlight the king that is in check
     * @param {string} color - Color of the king in check
     */
    highlightCheck(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    square.classList.add('check');
                    break;
                }
            }
        }
    }

    /**
     * Update the status message
     * @param {string} message - Status message to display
     */
    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});
