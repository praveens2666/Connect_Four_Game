/**
 * Controls.tsx — Game controls (rendered inside parent card)
 */

import React from 'react';
import type { Difficulty } from '../services/api';
import type { GameMode } from '../hooks/useGame';

interface ControlsProps {
  difficulty: Difficulty;
  gameMode: GameMode;
  onDifficultyChange: (d: Difficulty) => void;
  onGameModeChange: (m: GameMode) => void;
  onReset: () => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  difficulty, gameMode, onDifficultyChange, onGameModeChange, onReset, disabled,
}) => {
  const difficulties: { value: Difficulty; label: string; depth: string }[] = [
    { value: 'easy', label: 'Easy', depth: 'Depth 3' },
    { value: 'medium', label: 'Medium', depth: 'Depth 5' },
    { value: 'hard', label: 'Hard', depth: 'Depth 7' },
  ];

  const modes: { value: GameMode; label: string }[] = [
    { value: 'pvai', label: 'vs AI' },
    { value: 'pvp', label: 'vs Player' },
  ];

  return (
    <div className="space-y-8">
      {/* Difficulty */}
      <div>
        <h3 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.14em] mb-4">Difficulty</h3>
        <div className="flex gap-4">
          {difficulties.map((d) => (
            <button
              key={d.value}
              className={`diff-btn diff-${d.value} flex-1 ${difficulty === d.value ? 'diff-btn-active' : ''}`}
              onClick={() => onDifficultyChange(d.value)}
              disabled={disabled}
            >
              <div className="text-center py-1">
                <div>{d.label}</div>
                <div className="text-[10px] opacity-70 mt-1.5">{d.depth}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Game Mode */}
      <div>
        <h3 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.14em] mb-4">Game Mode</h3>
        <div className="flex gap-4">
          {modes.map((m) => (
            <button
              key={m.value}
              className={`mode-btn flex-1 ${gameMode === m.value ? 'mode-btn-active' : ''}`}
              onClick={() => onGameModeChange(m.value)}
              disabled={disabled}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Game */}
      <button className="btn-danger w-full flex items-center justify-center gap-2" onClick={onReset}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 4v6h6" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        New Game
      </button>
    </div>
  );
};

export default React.memo(Controls);
