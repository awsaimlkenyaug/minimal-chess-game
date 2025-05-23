# Minimal Chess

A lightweight chess implementation in JavaScript with all the essential rules and features, including an AI opponent with multiple difficulty levels.

![Chess Game Screenshot](screenshot.png)

## Features

- Complete chess board with all pieces
- Legal move validation for all pieces
- Turn-based gameplay
- Check and checkmate detection
- Simple and clean UI
- Responsive design

## AI Opponent

Play against the computer with three difficulty levels:

- **Easy**: Makes random legal moves
- **Medium**: Prioritizes captures and checks with some randomness
- **Hard**: Uses minimax algorithm with alpha-beta pruning for stronger play

## Game Options

- **Game Mode**: Human vs Human or Human vs Computer
- **Difficulty**: Easy, Medium, or Hard (when playing against computer)
- **Player Color**: Choose to play as White or Black

## How to Play

1. Open `index.html` in a web browser
2. Select your preferred game mode, difficulty, and color
3. Click "New Game" to start
4. Click on a piece to select it
5. Valid moves will be highlighted
6. Click on a highlighted square to move the piece
7. The game automatically detects check and checkmate

## Implementation Details

The game is implemented with vanilla JavaScript and consists of:

- **HTML**: Basic structure with a board container and game controls
- **CSS**: Styling for the board, pieces, and UI elements
- **JavaScript**: 
  - `chess.js`: Core game logic
  - `chess-ai.js`: AI opponent implementation

## Code Structure

- `ChessGame` class: Main game controller
  - `createBoard()`: Sets up the initial board state
  - `renderBoard()`: Updates the UI based on game state
  - `isValidMove()`: Checks if a move is legal
  - `movePiece()`: Executes a move and updates game state
  - `isKingInCheck()`: Detects if a king is in check
  - `isCheckmate()`: Determines if the game is over

- `ChessAI` class: Computer opponent
  - `getBestMove()`: Selects the best move based on difficulty
  - `minimax()`: Evaluates positions for the hard difficulty
  - `evaluatePosition()`: Scores board positions

## Limitations

This is a minimal implementation and doesn't include:
- Castling
- En passant
- Draw detection (except stalemate)
- Opening book
- Advanced AI evaluation

## License

MIT
