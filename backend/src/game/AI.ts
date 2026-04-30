/**
 * AI.ts — Connect Four AI using Minimax with Alpha-Beta Pruning
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                     HOW MINIMAX WORKS                                  │
 * │                                                                        │
 * │  Minimax is a recursive decision-making algorithm used in two-player  │
 * │  zero-sum games. It explores all possible future game states by       │
 * │  building a game tree:                                                │
 * │                                                                        │
 * │  • MAXIMIZING player (AI) picks the move with the HIGHEST score.      │
 * │  • MINIMIZING player (Human) picks the move with the LOWEST score.    │
 * │                                                                        │
 * │  At leaf nodes (terminal states or depth limit), a heuristic          │
 * │  evaluation function assigns a numeric score to the board position.   │
 * │                                                                        │
 * │  The algorithm assumes both players play optimally — the AI           │
 * │  maximizes its advantage while assuming the opponent minimizes it.    │
 * │                                                                        │
 * │  Time Complexity: O(b^d) where b = branching factor, d = depth.      │
 * │  For Connect Four: b ≈ 7 (columns), so depth 7 → ~800K nodes.       │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │              HOW ALPHA-BETA PRUNING IMPROVES PERFORMANCE              │
 * │                                                                        │
 * │  Alpha-Beta Pruning is an optimization of Minimax that eliminates     │
 * │  branches of the game tree that CANNOT influence the final decision.  │
 * │                                                                        │
 * │  • Alpha (α) = Best value the MAXIMIZER can guarantee so far.         │
 * │  • Beta  (β) = Best value the MINIMIZER can guarantee so far.         │
 * │                                                                        │
 * │  Pruning occurs when α ≥ β:                                           │
 * │  - In a MAX node: if the current value ≥ β, the minimizer would      │
 * │    never allow this path → prune remaining children (β-cutoff).       │
 * │  - In a MIN node: if the current value ≤ α, the maximizer would      │
 * │    never choose this path → prune remaining children (α-cutoff).      │
 * │                                                                        │
 * │  With good move ordering, Alpha-Beta can reduce the effective         │
 * │  branching factor from b to √b, examining O(b^(d/2)) nodes instead   │
 * │  of O(b^d). This allows searching roughly TWICE the depth in the     │
 * │  same time, making deeper searches feasible.                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { Board, ROWS, COLS, EMPTY, PLAYER, AI, CellValue } from './Board';

/** Difficulty settings map to search depth limits */
export type Difficulty = 'easy' | 'medium' | 'hard';

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 3,    // Shallow search — AI makes decent but beatable moves
  medium: 5,  // Moderate search — AI plays well, occasionally misses deep traps
  hard: 7,    // Deep search — AI plays near-optimally
};

/** Extremely large values used as +/- infinity in Minimax */
const INF = 1_000_000;

/**
 * Evaluates a "window" of 4 cells and returns a heuristic score.
 * A window is any group of 4 consecutive cells (horizontal, vertical, or diagonal).
 * 
 * Scoring logic:
 *   +100  → AI has 4 in this window (win)
 *   -100  → Player has 4 in this window (loss)
 *   +10   → AI has 3 with 1 empty (one move from winning)
 *   +5    → AI has 2 with 2 empty (building opportunity)
 *   -8    → Player has 3 with 1 empty (urgent block needed — weighted higher to prioritize defense)
 *   -3    → Player has 2 with 2 empty (potential threat)
 */
function evaluateWindow(window: CellValue[]): number {
  const aiCount = window.filter(c => c === AI).length;
  const playerCount = window.filter(c => c === PLAYER).length;
  const emptyCount = window.filter(c => c === EMPTY).length;

  // If both players occupy the window, it's contested and scores 0
  if (aiCount > 0 && playerCount > 0) return 0;

  // AI scoring
  if (aiCount === 4) return 100;
  if (aiCount === 3 && emptyCount === 1) return 10;
  if (aiCount === 2 && emptyCount === 2) return 5;

  // Player scoring (negative — these are threats to the AI)
  if (playerCount === 4) return -100;
  if (playerCount === 3 && emptyCount === 1) return -8;  // Slightly higher weight to prioritize blocking
  if (playerCount === 2 && emptyCount === 2) return -3;

  return 0;
}

/**
 * Heuristic Evaluation Function
 * 
 * Evaluates the entire board position from the AI's perspective.
 * Scans all possible 4-cell windows across the board and sums their scores.
 * Also adds a center-column bonus since controlling the center provides
 * more strategic opportunities in Connect Four.
 */
function evaluateBoard(board: Board): number {
  let score = 0;
  const g = board.grid;

  // --- Center column preference ---
  // The center column (index 3) is strategically valuable because it
  // participates in the most possible 4-in-a-row combinations.
  const centerCol = 3;
  const centerCount = g.reduce((count, row) => count + (row[centerCol] === AI ? 1 : 0), 0);
  score += centerCount * 6;

  // --- Evaluate all horizontal windows ---
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const window = [g[row][col], g[row][col + 1], g[row][col + 2], g[row][col + 3]];
      score += evaluateWindow(window as CellValue[]);
    }
  }

  // --- Evaluate all vertical windows ---
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col < COLS; col++) {
      const window = [g[row][col], g[row + 1][col], g[row + 2][col], g[row + 3][col]];
      score += evaluateWindow(window as CellValue[]);
    }
  }

  // --- Evaluate all diagonal (↘) windows ---
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const window = [g[row][col], g[row + 1][col + 1], g[row + 2][col + 2], g[row + 3][col + 3]];
      score += evaluateWindow(window as CellValue[]);
    }
  }

  // --- Evaluate all diagonal (↙) windows ---
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 3; col < COLS; col++) {
      const window = [g[row][col], g[row + 1][col - 1], g[row + 2][col - 2], g[row + 3][col - 3]];
      score += evaluateWindow(window as CellValue[]);
    }
  }

  return score;
}

/**
 * Checks if the current board state is a terminal node (game over).
 * A terminal node is reached when either player wins or the board is full (draw).
 */
function isTerminal(board: Board): boolean {
  return board.checkWin(PLAYER) !== null || board.checkWin(AI) !== null || board.isFull();
}

/**
 * MINIMAX WITH ALPHA-BETA PRUNING
 * 
 * This is the core AI decision-making algorithm.
 * 
 * Parameters:
 *   board          — current game state
 *   depth          — remaining search depth (decrements each level)
 *   alpha          — best score the MAXIMIZER (AI) can guarantee
 *   beta           — best score the MINIMIZER (Player) can guarantee
 *   isMaximizing   — true if it's the AI's turn (maximize), false for Player (minimize)
 * 
 * Returns: [score, bestColumn]
 *   score      — the evaluated score of the board at this node
 *   bestColumn — the column that leads to this score (-1 at leaf nodes)
 * 
 * Algorithm flow:
 *   1. Check if we've reached a terminal state or depth limit
 *   2. If maximizing (AI's turn):
 *      - Try each valid column, recurse with minimizing
 *      - Track the maximum score and update alpha
 *      - If alpha ≥ beta → PRUNE (β-cutoff): remaining branches can't affect outcome
 *   3. If minimizing (Player's turn):
 *      - Try each valid column, recurse with maximizing
 *      - Track the minimum score and update beta
 *      - If alpha ≥ beta → PRUNE (α-cutoff): remaining branches can't affect outcome
 */
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): [number, number] {
  // --- Base case: terminal state ---
  if (board.checkWin(AI) !== null) {
    // AI wins — return high positive score, scaled by depth so faster wins are preferred
    return [100000 + depth, -1];
  }
  if (board.checkWin(PLAYER) !== null) {
    // Player wins — return high negative score, scaled by depth so faster losses are avoided
    return [-(100000 + depth), -1];
  }
  if (board.isFull()) {
    // Draw — neutral score
    return [0, -1];
  }

  // --- Base case: depth limit reached ---
  // Use the heuristic evaluation to approximate the board's value
  if (depth === 0) {
    return [evaluateBoard(board), -1];
  }

  const validMoves = board.getValidMoves();

  if (isMaximizing) {
    // ─── AI's turn: MAXIMIZE the score ───
    let maxScore = -INF;
    let bestCol = validMoves[0]; // Default to first valid move

    for (const col of validMoves) {
      // Make the move
      board.dropDisc(col, AI);

      // Recurse: opponent's turn (minimize), one level deeper
      const [score] = minimax(board, depth - 1, alpha, beta, false);

      // Undo the move (backtrack)
      board.undoMove(col);

      // Update best score if this move is better
      if (score > maxScore) {
        maxScore = score;
        bestCol = col;
      }

      // Update alpha (best guaranteed score for maximizer)
      alpha = Math.max(alpha, maxScore);

      // ★ BETA CUTOFF (Pruning) ★
      // If alpha ≥ beta, the minimizer at a higher level would never
      // allow this path, so we can skip remaining siblings.
      if (alpha >= beta) {
        break; // Prune!
      }
    }

    return [maxScore, bestCol];
  } else {
    // ─── Player's turn: MINIMIZE the score ───
    let minScore = INF;
    let bestCol = validMoves[0];

    for (const col of validMoves) {
      // Make the move
      board.dropDisc(col, PLAYER);

      // Recurse: AI's turn (maximize), one level deeper
      const [score] = minimax(board, depth - 1, alpha, beta, true);

      // Undo the move (backtrack)
      board.undoMove(col);

      // Update best score if this move is worse (from AI's perspective)
      if (score < minScore) {
        minScore = score;
        bestCol = col;
      }

      // Update beta (best guaranteed score for minimizer)
      beta = Math.min(beta, minScore);

      // ★ ALPHA CUTOFF (Pruning) ★
      // If alpha ≥ beta, the maximizer at a higher level already has
      // a better option, so this branch is irrelevant.
      if (alpha >= beta) {
        break; // Prune!
      }
    }

    return [minScore, bestCol];
  }
}

/**
 * Public entry point: determines the best column for the AI to play.
 * 
 * @param board     — current board state
 * @param difficulty — 'easy' | 'medium' | 'hard' (controls search depth)
 * @returns          — the column index (0–6) for the AI's best move
 */
export function getBestMove(board: Board, difficulty: Difficulty): number {
  const depth = DEPTH_MAP[difficulty];

  // Run Minimax with Alpha-Beta pruning starting as the maximizing player
  // Alpha starts at -∞ (worst for maximizer)
  // Beta starts at +∞ (worst for minimizer)
  const [, bestCol] = minimax(board, depth, -INF, INF, true);

  return bestCol;
}
