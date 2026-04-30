/**
 * StatusBar.tsx — Displays current game status
 */

import React, { useEffect, useState } from 'react';
import type { GameStatus } from '../services/api';
import type { GameMode } from '../hooks/useGame';

interface StatusBarProps {
  status: GameStatus;
  isThinking: boolean;
  winner: string | null;
  currentTurn: 'player' | 'ai';
  moveCount: number;
  gameMode: GameMode;
  pvpTurn: 1 | 2;
}

const Confetti: React.FC = () => {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      color: ['#d63031', '#fdcb6e', '#4f46e5', '#059669', '#f97316'][
        Math.floor(Math.random() * 5)
      ],
      size: 5 + Math.random() * 5,
    }))
  );
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '1px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </>
  );
};

const StatusBar: React.FC<StatusBarProps> = ({
  status, isThinking, winner, currentTurn, moveCount, gameMode, pvpTurn,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (status === 'player_wins' || status === 'ai_wins') {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
    setShowConfetti(false);
  }, [status]);

  const renderContent = () => {
    if (status === 'player_wins' || status === 'ai_wins') {
      return (
        <div className="winner-announce text-center py-2">
          <div className="text-lg font-bold text-[#1a1a2e]">{winner} Wins!</div>
          <div className="text-[11px] text-[#9ca3af] mt-1">{moveCount} moves</div>
        </div>
      );
    }
    if (status === 'draw') {
      return (
        <div className="winner-announce text-center py-2">
          <div className="text-lg font-bold text-[#1a1a2e]">Draw</div>
          <div className="text-[11px] text-[#9ca3af] mt-1">Well played — try again?</div>
        </div>
      );
    }
    if (isThinking) {
      return (
        <div className="flex items-center gap-4">
          <div className="thinking-spinner" />
          <div>
            <div className="text-sm font-semibold text-[#1a1a2e]">AI thinking…</div>
            <div className="text-[11px] text-[#9ca3af] mt-0.5">Minimax + Alpha-Beta</div>
          </div>
        </div>
      );
    }

    // Determine turn display
    if (gameMode === 'pvp') {
      const isP1 = pvpTurn === 1;
      return (
        <div className="flex items-center gap-4">
          <div className={`w-3.5 h-3.5 rounded-full ${isP1 ? 'bg-[#d63031]' : 'bg-[#fdcb6e]'}`} />
          <div>
            <div className="text-sm font-semibold text-[#1a1a2e]">
              {isP1 ? 'Player 1 (Red)' : 'Player 2 (Yellow)'}
            </div>
            <div className="text-[11px] text-[#9ca3af] mt-0.5">Click a column to drop</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className={`w-3.5 h-3.5 rounded-full ${currentTurn === 'player' ? 'bg-[#d63031]' : 'bg-[#fdcb6e]'}`} />
        <div>
          <div className="text-sm font-semibold text-[#1a1a2e]">
            {currentTurn === 'player' ? 'Your Turn' : "AI's Turn"}
          </div>
          <div className="text-[11px] text-[#9ca3af] mt-0.5">Click a column to drop</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="glass-panel px-6 sm:px-8 py-5 w-full max-w-md">{renderContent()}</div>
    </>
  );
};

export default React.memo(StatusBar);
