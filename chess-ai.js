/**
 * Chess AI Implementation
 * Provides computer opponent functionality with multiple difficulty levels
 */

class ChessAI {
    /**
     * Initialize the Chess AI
     * @param {string} difficulty - AI difficulty level: 'easy', 'medium', or 'hard'
     */
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
    }

    /**
     * Set the AI difficulty level
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    /**
     * Get the best move for the current position
     * @param {ChessGame} game - The current game state
     * @param {string} aiColor - The color the AI is playing ('white' or 'black')
     * @returns {Object} - The selected move {fromRow, fromCol, toRow, toCol}
     */
    getBestMove(game, aiColor) {
        switch (this.difficulty) {
            case 'easy':
                return this.getRandomMove(game, aiColor);
            case 'medium':
                return this.getMediumMove(game, aiColor);
            case 'hard':
                return this.getHardMove(game, aiColor);
            default:
                return this.getRandomMove(game, aiColor);
        }
    }

    /**
     * Get a random legal move (Easy difficulty)
     * @param {ChessGame} game - The current game state
     * @param {string} aiColor - The color the AI is playing
     * @returns {Object} - The selected move
     */
    getRandomMove(game, aiColor) {
        const moves = this.getAllLegalMoves(game, aiColor);
        
        if (moves.length === 0) return null;
        
        // Select a random move from all legal moves
        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }

    /**
     * Get a move with basic evaluation (Medium difficulty)
     * @param {ChessGame} game - The current game state
     * @param {string} aiColor - The color the AI is playing
     * @returns {Object} - The selected move
     */
    getMediumMove(game, aiColor) {
        const moves = this.getAllLegalMoves(game, aiColor);
        
        if (moves.length === 0) return null;
        
        // Prioritize captures and checks
        const scoredMoves = moves.map(move => {
            let score = 0;
            
            // Check if it's a capture move
            const targetPiece = game.board[move.toRow][move.toCol];
            if (targetPiece) {
                // Assign value to captured piece
                score += this.getPieceValue(targetPiece.type);
            }
            
            // Try the move
            const originalTarget = game.board[move.toRow][move.toCol];
            const movingPiece = game.board[move.fromRow][move.fromCol];
            
            game.board[move.toRow][move.toCol] = movingPiece;
            game.board[move.fromRow][move.fromCol] = null;
            
            // Check if move puts opponent in check
            const opponentColor = aiColor === 'white' ? 'black' : 'white';
            if (game.isKingInCheck(opponentColor)) {
                score += 10; // Bonus for check
            }
            
            // Undo the move
            game.board[move.fromRow][move.fromCol] = movingPiece;
            game.board[move.toRow][move.toCol] = originalTarget;
            
            return { move, score };
        });
        
        // Sort moves by score (highest first)
        scoredMoves.sort((a, b) => b.score - a.score);
        
        // 80% chance to pick the best move, 20% chance to pick a random move
        if (Math.random() < 0.8) {
            return scoredMoves[0].move;
        } else {
            const randomIndex = Math.floor(Math.random() * moves.length);
            return moves[randomIndex];
        }
    }

    /**
     * Get the best move using minimax algorithm (Hard difficulty)
     * @param {ChessGame} game - The current game state
     * @param {string} aiColor - The color the AI is playing
     * @returns {Object} - The selected move
     */
    getHardMove(game, aiColor) {
        const moves = this.getAllLegalMoves(game, aiColor);
        
        if (moves.length === 0) return null;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Evaluate each move using minimax
        for (const move of moves) {
            // Try the move
            const originalTarget = game.board[move.toRow][move.toCol];
            const movingPiece = game.board[move.fromRow][move.fromCol];
            
            game.board[move.toRow][move.toCol] = movingPiece;
            game.board[move.fromRow][move.fromCol] = null;
            
            // Evaluate position with minimax
            const score = this.minimax(game, 3, -Infinity, Infinity, false, aiColor);
            
            // Undo the move
            game.board[move.fromRow][move.fromCol] = movingPiece;
            game.board[move.toRow][move.toCol] = originalTarget;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    /**
     * Minimax algorithm with alpha-beta pruning
     * @param {ChessGame} game - The current game state
     * @param {number} depth - Search depth
     * @param {number} alpha - Alpha value for pruning
     * @param {number} beta - Beta value for pruning
     * @param {boolean} isMaximizing - Whether current player is maximizing
     * @param {string} aiColor - The color the AI is playing
     * @returns {number} - Evaluation score
     */
    minimax(game, depth, alpha, beta, isMaximizing, aiColor) {
        // Base case: reached maximum depth or game over
        if (depth === 0 || game.gameOver) {
            return this.evaluatePosition(game, aiColor);
        }
        
        const currentColor = isMaximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white');
        const moves = this.getAllLegalMoves(game, currentColor);
        
        if (moves.length === 0) {
            // No legal moves - either checkmate or stalemate
            if (game.isKingInCheck(currentColor)) {
                // Checkmate
                return isMaximizing ? -1000 : 1000;
            } else {
                // Stalemate
                return 0;
            }
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            
            for (const move of moves) {
                // Try the move
                const originalTarget = game.board[move.toRow][move.toCol];
                const movingPiece = game.board[move.fromRow][move.fromCol];
                
                game.board[move.toRow][move.toCol] = movingPiece;
                game.board[move.fromRow][move.fromCol] = null;
                
                // Recursive evaluation
                const eval = this.minimax(game, depth - 1, alpha, beta, false, aiColor);
                
                // Undo the move
                game.board[move.fromRow][move.fromCol] = movingPiece;
                game.board[move.toRow][move.toCol] = originalTarget;
                
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            return maxEval;
        } else {
            let minEval = Infinity;
            
            for (const move of moves) {
                // Try the move
                const originalTarget = game.board[move.toRow][move.toCol];
                const movingPiece = game.board[move.fromRow][move.fromCol];
                
                game.board[move.toRow][move.toCol] = movingPiece;
                game.board[move.fromRow][move.fromCol] = null;
                
                // Recursive evaluation
                const eval = this.minimax(game, depth - 1, alpha, beta, true, aiColor);
                
                // Undo the move
                game.board[move.fromRow][move.fromCol] = movingPiece;
                game.board[move.toRow][move.toCol] = originalTarget;
                
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            return minEval;
        }
    }

    /**
     * Evaluate the current board position
     * @param {ChessGame} game - The current game state
     * @param {string} aiColor - The color the AI is playing
     * @returns {number} - Evaluation score
     */
    evaluatePosition(game, aiColor) {
        let score = 0;
        
        // Material value
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = game.board[row][col];
                if (piece) {
                    const pieceValue = this.getPieceValue(piece.type);
                    if (piece.color === aiColor) {
                        score += pieceValue;
                    } else {
                        score -= pieceValue;
                    }
                }
            }
        }
        
        // Check and checkmate
        const opponentColor = aiColor === 'white' ? 'black' : 'white';
        
        if (game.isKingInCheck(opponentColor)) {
            score += 50; // Bonus for putting opponent in check
            
            if (game.isCheckmate(opponentColor)) {
                score += 1000; // Huge bonus for checkmate
            }
        }
        
        if (game.isKingInCheck(aiColor)) {
            score -= 50; // Penalty for being in check
            
            if (game.isCheckmate(aiColor)) {
                score -= 1000; // Huge penalty for being checkmated
            }
        }
        
        return score;
    }

    /**
     * Get the value of a chess piece
     * @param {string} pieceType - The type of piece
     * @returns {number} - The piece value
     */
    getPieceValue(pieceType) {
        switch (pieceType) {
            case 'pawn': return 1;
            case 'knight': return 3;
            case 'bishop': return 3;
            case 'rook': return 5;
            case 'queen': return 9;
            case 'king': return 100;
            default: return 0;
        }
    }

    /**
     * Get all legal moves for a given color
     * @param {ChessGame} game - The current game state
     * @param {string} color - The color to get moves for
     * @returns {Array} - Array of legal moves
     */
    getAllLegalMoves(game, color) {
        const moves = [];
        
        // Check all pieces of the given color
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = game.board[fromRow][fromCol];
                
                if (piece && piece.color === color) {
                    // Check all possible destination squares
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (game.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                // Try the move to see if it leaves the king in check
                                const originalTarget = game.board[toRow][toCol];
                                game.board[toRow][toCol] = piece;
                                game.board[fromRow][fromCol] = null;
                                
                                const kingInCheck = game.isKingInCheck(color);
                                
                                // Undo the move
                                game.board[fromRow][fromCol] = piece;
                                game.board[toRow][toCol] = originalTarget;
                                
                                // Only add legal moves that don't leave the king in check
                                if (!kingInCheck) {
                                    moves.push({ fromRow, fromCol, toRow, toCol });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return moves;
    }
}
