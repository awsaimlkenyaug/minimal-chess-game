# Minimal Chess

A lightweight chess implementation in JavaScript with all the essential rules and features.

![Chess Game Screenshot](screenshot.png)

## Features

- Complete chess board with all pieces
- Legal move validation for all pieces
- Turn-based gameplay
- Check and checkmate detection
- Simple and clean UI
- Responsive design

## How to Play

1. Open `index.html` in a web browser
2. White moves first
3. Click on a piece to select it
4. Valid moves will be highlighted
5. Click on a highlighted square to move the piece
6. The game automatically detects check and checkmate

## Implementation Details

The game is implemented with vanilla JavaScript and consists of:

- **HTML**: Basic structure with a board container and status display
- **CSS**: Styling for the board, pieces, and UI elements
- **JavaScript**: Game logic including:
  - Board representation as a 2D array
  - Piece movement validation
  - Check and checkmate detection
  - UI interaction

## Code Structure

- `ChessGame` class: Main game controller
  - `createBoard()`: Sets up the initial board state
  - `renderBoard()`: Updates the UI based on game state
  - `isValidMove()`: Checks if a move is legal
  - `movePiece()`: Executes a move and updates game state
  - `isKingInCheck()`: Detects if a king is in check
  - `isCheckmate()`: Determines if the game is over

## Limitations

This is a minimal implementation and doesn't include:
- Castling
- En passant
- Draw detection
- Move history
- Time controls

## License

MIT
