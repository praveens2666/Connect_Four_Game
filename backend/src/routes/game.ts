/**
 * game.ts — Express API Routes for Connect Four
 * 
 * Endpoints:
 *   POST /api/move   — Player makes a move; AI responds
 *   POST /api/reset  — Reset the game board
 *   GET  /api/state  — Get current board state
 */

import { Router, Request, Response } from 'express';
import { GameController } from '../game/GameController';
import { Difficulty } from '../game/AI';

const router = Router();

// Singleton game controller instance (one game at a time per server)
const gameController = new GameController();

/**
 * POST /api/move
 * 
 * Request body:
 *   { column: number, difficulty?: 'easy' | 'medium' | 'hard' }
 * 
 * Response:
 *   {
 *     board: number[][],        — Updated 6×7 board
 *     playerMove: object|null,  — { row, col } of player's disc
 *     aiMove: object|null,      — { row, col } of AI's disc
 *     status: string,           — 'playing' | 'player_wins' | 'ai_wins' | 'draw'
 *     winner: string|null,      — 'Player' | 'AI' | null
 *     winningCells: array|null  — [[row,col], ...] of winning 4 discs
 *   }
 */
router.post('/move', (req: Request, res: Response) => {
  const { column, difficulty = 'medium' } = req.body;

  // Validate column input
  if (column === undefined || column === null || column < 0 || column > 6) {
    res.status(400).json({ error: 'Invalid column. Must be 0-6.' });
    return;
  }

  // Validate difficulty
  const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const diff: Difficulty = validDifficulties.includes(difficulty) ? difficulty : 'medium';

  const result = gameController.makeMove(column, diff);
  res.json(result);
});

/**
 * POST /api/reset
 * 
 * Resets the game board to its initial empty state.
 * 
 * Response:
 *   { board: number[][], status: 'playing' }
 */
/**
 * POST /api/pvp-move
 * 
 * PvP mode — drops a disc for the specified player without triggering AI.
 * Request body:
 *   { column: number, player: 1 | 2 }
 */
router.post('/pvp-move', (req: Request, res: Response) => {
  const { column, player = 1 } = req.body;

  if (column === undefined || column === null || column < 0 || column > 6) {
    res.status(400).json({ error: 'Invalid column. Must be 0-6.' });
    return;
  }

  if (player !== 1 && player !== 2) {
    res.status(400).json({ error: 'Invalid player. Must be 1 or 2.' });
    return;
  }

  const result = gameController.makePvPMove(column, player);
  res.json(result);
});

router.post('/reset', (_req: Request, res: Response) => {
  const result = gameController.reset();
  res.json(result);
});

/**
 * GET /api/state
 * 
 * Returns the current game state without making any moves.
 * 
 * Response:
 *   { board: number[][], status: string }
 */
router.get('/state', (_req: Request, res: Response) => {
  const result = gameController.getState();
  res.json(result);
});

export default router;
