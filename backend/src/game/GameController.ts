/**
 * GameController.ts — Orchestrates game state and flow
 * 
 * Acts as the intermediary between the API routes and the game logic.
 * Manages the board instance, processes moves, and determines game outcomes.
 */

import { Board, PLAYER, AI, CellValue, WinningCells } from './Board';
import { getBestMove, Difficulty } from './AI';

export type GameStatus = 'playing' | 'player_wins' | 'ai_wins' | 'draw';

export interface MoveResult {
  board: number[][];
  playerMove: { row: number; col: number } | null;
  aiMove: { row: number; col: number } | null;
  status: GameStatus;
  winner: string | null;
  winningCells: WinningCells | null;
}

export class GameController {
  private board: Board;
  private status: GameStatus;

  constructor() {
    this.board = new Board();
    this.status = 'playing';
  }

  /**
   * Resets the game to its initial state.
   */
  reset(): { board: number[][]; status: GameStatus } {
    this.board = new Board();
    this.status = 'playing';
    return {
      board: this.board.toJSON(),
      status: this.status,
    };
  }

  /**
   * Returns the current game state.
   */
  getState(): { board: number[][]; status: GameStatus } {
    return {
      board: this.board.toJSON(),
      status: this.status,
    };
  }

  /**
   * Processes a player's move and then lets the AI respond.
   * 
   * Flow:
   *  1. Validate the move
   *  2. Drop the player's disc
   *  3. Check if the player won
   *  4. If not, let the AI make its move using Minimax
   *  5. Check if the AI won or if it's a draw
   *  6. Return the full result
   */
  makeMove(col: number, difficulty: Difficulty = 'medium'): MoveResult {
    // Game is already over — no more moves allowed
    if (this.status !== 'playing') {
      return {
        board: this.board.toJSON(),
        playerMove: null,
        aiMove: null,
        status: this.status,
        winner: this.getWinnerName(),
        winningCells: this.getWinningCells(),
      };
    }

    // --- Step 1: Player's move ---
    const playerRow = this.board.dropDisc(col, PLAYER);
    if (playerRow === -1) {
      // Invalid move — column is full
      return {
        board: this.board.toJSON(),
        playerMove: null,
        aiMove: null,
        status: this.status,
        winner: null,
        winningCells: null,
      };
    }

    // --- Step 2: Check if player won ---
    const playerWin = this.board.checkWin(PLAYER);
    if (playerWin) {
      this.status = 'player_wins';
      return {
        board: this.board.toJSON(),
        playerMove: { row: playerRow, col },
        aiMove: null,
        status: this.status,
        winner: 'Player',
        winningCells: playerWin,
      };
    }

    // --- Step 3: Check for draw after player move ---
    if (this.board.isFull()) {
      this.status = 'draw';
      return {
        board: this.board.toJSON(),
        playerMove: { row: playerRow, col },
        aiMove: null,
        status: this.status,
        winner: null,
        winningCells: null,
      };
    }

    // --- Step 4: AI's move ---
    const aiCol = getBestMove(this.board, difficulty);
    const aiRow = this.board.dropDisc(aiCol, AI);

    // --- Step 5: Check if AI won ---
    const aiWin = this.board.checkWin(AI);
    if (aiWin) {
      this.status = 'ai_wins';
      return {
        board: this.board.toJSON(),
        playerMove: { row: playerRow, col },
        aiMove: { row: aiRow, col: aiCol },
        status: this.status,
        winner: 'AI',
        winningCells: aiWin,
      };
    }

    // --- Step 6: Check for draw after AI move ---
    if (this.board.isFull()) {
      this.status = 'draw';
    }

    return {
      board: this.board.toJSON(),
      playerMove: { row: playerRow, col },
      aiMove: { row: aiRow, col: aiCol },
      status: this.status,
      winner: null,
      winningCells: null,
    };
  }

  /**
   * Makes an AI-only move (used for AI vs AI mode).
   */
  makeAIMove(player: CellValue, difficulty: Difficulty = 'medium'): MoveResult {
    if (this.status !== 'playing') {
      return {
        board: this.board.toJSON(),
        playerMove: null,
        aiMove: null,
        status: this.status,
        winner: this.getWinnerName(),
        winningCells: this.getWinningCells(),
      };
    }

    const col = getBestMove(this.board, difficulty);
    const row = this.board.dropDisc(col, player);

    const win = this.board.checkWin(player);
    if (win) {
      this.status = player === PLAYER ? 'player_wins' : 'ai_wins';
      return {
        board: this.board.toJSON(),
        playerMove: player === PLAYER ? { row, col } : null,
        aiMove: player === AI ? { row, col } : null,
        status: this.status,
        winner: player === PLAYER ? 'Player 1' : 'Player 2',
        winningCells: win,
      };
    }

    if (this.board.isFull()) {
      this.status = 'draw';
    }

    return {
      board: this.board.toJSON(),
      playerMove: player === PLAYER ? { row, col } : null,
      aiMove: player === AI ? { row, col } : null,
      status: this.status,
      winner: null,
      winningCells: null,
    };
  }

  /**
   * Processes a single PvP move — drops one disc for the given player (1 or 2).
   * Does NOT trigger an AI response.
   */
  makePvPMove(col: number, player: number): MoveResult {
    if (this.status !== 'playing') {
      return {
        board: this.board.toJSON(),
        playerMove: null,
        aiMove: null,
        status: this.status,
        winner: this.getWinnerName(),
        winningCells: this.getWinningCells(),
      };
    }

    const cellValue = player === 1 ? PLAYER : AI;
    const row = this.board.dropDisc(col, cellValue);
    if (row === -1) {
      return {
        board: this.board.toJSON(),
        playerMove: null,
        aiMove: null,
        status: this.status,
        winner: null,
        winningCells: null,
      };
    }

    const win = this.board.checkWin(cellValue);
    if (win) {
      this.status = player === 1 ? 'player_wins' : 'ai_wins';
      return {
        board: this.board.toJSON(),
        playerMove: { row, col },
        aiMove: null,
        status: this.status,
        winner: player === 1 ? 'Player 1' : 'Player 2',
        winningCells: win,
      };
    }

    if (this.board.isFull()) {
      this.status = 'draw';
    }

    return {
      board: this.board.toJSON(),
      playerMove: { row, col },
      aiMove: null,
      status: this.status,
      winner: null,
      winningCells: null,
    };
  }

  private getWinnerName(): string | null {
    if (this.status === 'player_wins') return 'Player';
    if (this.status === 'ai_wins') return 'AI';
    return null;
  }

  private getWinningCells(): WinningCells | null {
    if (this.status === 'player_wins') return this.board.checkWin(PLAYER);
    if (this.status === 'ai_wins') return this.board.checkWin(AI);
    return null;
  }
}
