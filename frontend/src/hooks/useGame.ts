/**
 * useGame.ts — Custom React hook managing all game state and API interactions
 */

import { useState, useCallback, useEffect } from 'react';
import { makeMove, resetGame, getGameState, makePvPMove } from '../services/api';
import type { Difficulty, GameStatus } from '../services/api';

export type GameMode = 'pvai' | 'pvp';

interface AnimatingCell {
  row: number;
  col: number;
}

interface GameState {
  board: number[][];
  status: GameStatus;
  difficulty: Difficulty;
  gameMode: GameMode;
  isThinking: boolean;
  winningCells: [number, number][] | null;
  winner: string | null;
  currentTurn: 'player' | 'ai';
  animatingCells: AnimatingCell[];
  hoverCol: number | null;
  moveCount: number;
  pvpTurn: 1 | 2;
}

const EMPTY_BOARD = Array.from({ length: 6 }, () => Array(7).fill(0));

export function useGame() {
  const [state, setState] = useState<GameState>({
    board: EMPTY_BOARD,
    status: 'playing',
    difficulty: 'medium',
    gameMode: 'pvai',
    isThinking: false,
    winningCells: null,
    winner: null,
    currentTurn: 'player',
    animatingCells: [],
    hoverCol: null,
    moveCount: 0,
    pvpTurn: 1,
  });

  useEffect(() => {
    getGameState()
      .then((data) => {
        setState((prev) => ({ ...prev, board: data.board, status: data.status }));
      })
      .catch(() => {});
  }, []);

  const handleColumnClick = useCallback(
    async (col: number) => {
      if (
        state.status !== 'playing' ||
        state.isThinking ||
        !state.board[0] || state.board[0][col] !== 0
      ) {
        return;
      }

      if (state.gameMode === 'pvp') {
        // PvP mode — use dedicated PvP endpoint
        setState((prev) => ({ ...prev, isThinking: true }));
        try {
          const result = await makePvPMove(col, state.pvpTurn);
          const newAnimating: AnimatingCell[] = [];
          if (result.playerMove) newAnimating.push(result.playerMove);

          setState((prev) => ({
            ...prev,
            board: result.board,
            status: result.status,
            winner: result.winner,
            winningCells: result.winningCells,
            isThinking: false,
            animatingCells: newAnimating,
            currentTurn: prev.pvpTurn === 1 ? 'ai' : 'player',
            pvpTurn: prev.pvpTurn === 1 ? 2 : 1,
            moveCount: prev.moveCount + 1,
          }));
        } catch {
          setState((prev) => ({ ...prev, isThinking: false }));
        }
        return;
      }

      // PvAI mode
      setState((prev) => ({ ...prev, isThinking: true }));
      try {
        const result = await makeMove(col, state.difficulty);
        const playerAnim: AnimatingCell[] = [];
        if (result.playerMove) playerAnim.push(result.playerMove);

        setState((prev) => ({ ...prev, animatingCells: playerAnim }));
        await new Promise((resolve) => setTimeout(resolve, 400));

        const allAnim: AnimatingCell[] = [];
        if (result.aiMove) allAnim.push(result.aiMove);

        setState((prev) => ({
          ...prev,
          board: result.board,
          status: result.status,
          winner: result.winner,
          winningCells: result.winningCells,
          isThinking: false,
          animatingCells: allAnim,
          moveCount: prev.moveCount + (result.aiMove ? 2 : 1),
        }));
      } catch {
        setState((prev) => ({ ...prev, isThinking: false }));
      }
    },
    [state.status, state.isThinking, state.difficulty, state.gameMode, state.board, state.pvpTurn]
  );

  const handleReset = useCallback(async () => {
    try {
      const result = await resetGame();
      setState((prev) => ({
        ...prev,
        board: result.board,
        status: result.status,
        winner: null,
        winningCells: null,
        isThinking: false,
        animatingCells: [],
        currentTurn: 'player',
        moveCount: 0,
        pvpTurn: 1,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        board: EMPTY_BOARD,
        status: 'playing',
        winner: null,
        winningCells: null,
        isThinking: false,
        animatingCells: [],
        currentTurn: 'player',
        moveCount: 0,
        pvpTurn: 1,
      }));
    }
  }, []);

  const setDifficulty = useCallback(
    (difficulty: Difficulty) => {
      setState((prev) => ({ ...prev, difficulty }));
      handleReset();
    },
    [handleReset]
  );

  const setGameMode = useCallback(
    (gameMode: GameMode) => {
      setState((prev) => ({ ...prev, gameMode }));
      handleReset();
    },
    [handleReset]
  );

  const setHoverCol = useCallback((col: number | null) => {
    setState((prev) => ({ ...prev, hoverCol: col }));
  }, []);

  return {
    ...state,
    handleColumnClick,
    handleReset,
    setDifficulty,
    setGameMode,
    setHoverCol,
  };
}
