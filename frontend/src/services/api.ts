/**
 * api.ts — API service layer for communicating with the Connect Four backend
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'player_wins' | 'ai_wins' | 'draw';

export interface MoveResponse {
  board: number[][];
  playerMove: { row: number; col: number } | null;
  aiMove: { row: number; col: number } | null;
  status: GameStatus;
  winner: string | null;
  winningCells: [number, number][] | null;
}

export interface StateResponse {
  board: number[][];
  status: GameStatus;
}

/**
 * Sends the player's move to the backend and receives the AI's response.
 */
export async function makeMove(column: number, difficulty: Difficulty): Promise<MoveResponse> {
  const response = await fetch(`${API_BASE}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, difficulty }),
  });
  if (!response.ok) throw new Error('Failed to make move');
  return response.json();
}

/**
 * Resets the game board on the backend.
 */
export async function resetGame(): Promise<StateResponse> {
  const response = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to reset game');
  return response.json();
}

/**
 * Gets the current game state from the backend.
 */
export async function getGameState(): Promise<StateResponse> {
  const response = await fetch(`${API_BASE}/state`);
  if (!response.ok) throw new Error('Failed to get game state');
  return response.json();
}

/**
 * PvP mode — drops a disc for the specified player (no AI).
 */
export async function makePvPMove(column: number, player: 1 | 2): Promise<MoveResponse> {
  const response = await fetch(`${API_BASE}/pvp-move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, player }),
  });
  if (!response.ok) throw new Error('Failed to make PvP move');
  return response.json();
}
