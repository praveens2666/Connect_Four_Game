/**
 * Board.ts — Connect Four Board Representation
 * 
 * The board is a 2D array with 6 rows and 7 columns.
 * Cell values: 0 = empty, 1 = Player (Human), 2 = AI (Computer)
 * 
 * Row 0 is the TOP of the board (first row visually).
 * Row 5 is the BOTTOM of the board (where discs land first due to gravity).
 */

export const ROWS = 6;
export const COLS = 7;
export const EMPTY = 0;
export const PLAYER = 1;
export const AI = 2;

export type CellValue = typeof EMPTY | typeof PLAYER | typeof AI;
export type BoardGrid = CellValue[][];
export type WinningCells = [number, number][];

export class Board {
  grid: BoardGrid;

  constructor(grid?: BoardGrid) {
    if (grid) {
      // Deep clone the provided grid
      this.grid = grid.map(row => [...row]);
    } else {
      // Initialize an empty 6×7 board filled with zeros
      this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    }
  }

  /**
   * Creates a deep clone of the current board.
   */
  clone(): Board {
    return new Board(this.grid);
  }

  /**
   * Checks if a column is a valid move (has at least one empty slot).
   */
  isValidMove(col: number): boolean {
    return col >= 0 && col < COLS && this.grid[0][col] === EMPTY;
  }

  /**
   * Returns an array of column indices that still have room for a disc.
   * Columns are ordered to prefer center columns first (better for AI evaluation).
   */
  getValidMoves(): number[] {
    const moves: number[] = [];
    // Evaluate columns in order from center outward for better pruning
    const columnOrder = [3, 2, 4, 1, 5, 0, 6];
    for (const col of columnOrder) {
      if (this.isValidMove(col)) {
        moves.push(col);
      }
    }
    return moves;
  }

  /**
   * Drops a disc into the specified column for the given player.
   * The disc falls to the lowest empty row (simulating gravity).
   * Returns the row where the disc landed, or -1 if the column is full.
   */
  dropDisc(col: number, player: CellValue): number {
    if (!this.isValidMove(col)) return -1;

    // Start from the bottom row and find the first empty cell
    for (let row = ROWS - 1; row >= 0; row--) {
      if (this.grid[row][col] === EMPTY) {
        this.grid[row][col] = player;
        return row;
      }
    }
    return -1;
  }

  /**
   * Undoes the last move in a given column by removing the topmost disc.
   * This is essential for the Minimax algorithm to explore and backtrack moves.
   */
  undoMove(col: number): void {
    for (let row = 0; row < ROWS; row++) {
      if (this.grid[row][col] !== EMPTY) {
        this.grid[row][col] = EMPTY;
        return;
      }
    }
  }

  /**
   * Checks if the given player has won the game.
   * Scans all possible 4-in-a-row combinations:
   *   - Horizontal (→)
   *   - Vertical (↓)
   *   - Diagonal down-right (↘)
   *   - Diagonal down-left (↙)
   * 
   * Returns the array of winning cell positions, or null if no win.
   */
  checkWin(player: CellValue): WinningCells | null {
    const g = this.grid;

    // --- Horizontal check ---
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        if (
          g[row][col] === player &&
          g[row][col + 1] === player &&
          g[row][col + 2] === player &&
          g[row][col + 3] === player
        ) {
          return [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]];
        }
      }
    }

    // --- Vertical check ---
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col < COLS; col++) {
        if (
          g[row][col] === player &&
          g[row + 1][col] === player &&
          g[row + 2][col] === player &&
          g[row + 3][col] === player
        ) {
          return [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]];
        }
      }
    }

    // --- Diagonal (↘) check ---
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 0; col <= COLS - 4; col++) {
        if (
          g[row][col] === player &&
          g[row + 1][col + 1] === player &&
          g[row + 2][col + 2] === player &&
          g[row + 3][col + 3] === player
        ) {
          return [
            [row, col], [row + 1, col + 1],
            [row + 2, col + 2], [row + 3, col + 3],
          ];
        }
      }
    }

    // --- Diagonal (↙) check ---
    for (let row = 0; row <= ROWS - 4; row++) {
      for (let col = 3; col < COLS; col++) {
        if (
          g[row][col] === player &&
          g[row + 1][col - 1] === player &&
          g[row + 2][col - 2] === player &&
          g[row + 3][col - 3] === player
        ) {
          return [
            [row, col], [row + 1, col - 1],
            [row + 2, col - 2], [row + 3, col - 3],
          ];
        }
      }
    }

    return null;
  }

  /**
   * Returns true if every column is full (no valid moves remain → draw).
   */
  isFull(): boolean {
    return this.grid[0].every(cell => cell !== EMPTY);
  }

  /**
   * Returns a plain 2D array representation of the board for API responses.
   */
  toJSON(): number[][] {
    return this.grid.map(row => [...row]);
  }
}
