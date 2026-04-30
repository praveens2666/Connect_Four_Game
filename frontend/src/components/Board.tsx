/**
 * Board.tsx — Connect Four game board
 */

import React from 'react';
import Cell from './Cell';

interface BoardProps {
  board: number[][];
  winningCells: [number, number][] | null;
  animatingCells: { row: number; col: number }[];
  hoverCol: number | null;
  disabled: boolean;
  onColumnClick: (col: number) => void;
  onHoverCol: (col: number | null) => void;
}

const Board: React.FC<BoardProps> = ({
  board, winningCells, animatingCells, hoverCol, disabled, onColumnClick, onHoverCol,
}) => {
  const isWinningCell = (row: number, col: number): boolean =>
    winningCells?.some(([r, c]) => r === row && c === col) ?? false;

  const isAnimatingCell = (row: number, col: number): boolean =>
    animatingCells.some((c) => c.row === row && c.col === col);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Hover arrows */}
      <div className="grid gap-[var(--cell-gap)] mb-2" style={{ gridTemplateColumns: `repeat(7, var(--cell-size))` }}>
        {Array.from({ length: 7 }).map((_, col) => (
          <div
            key={col}
            className={`flex justify-center items-center h-5 transition-opacity duration-100 ${
              hoverCol === col && !disabled ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="#6b7280"><path d="M10 14L5 8h10L10 14z" /></svg>
          </div>
        ))}
      </div>

      {/* Board frame — navy blue like the real game */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'linear-gradient(180deg, #2c3e6b 0%, #1b2838 100%)',
          boxShadow: '0 8px 32px rgba(27,40,56,0.25), 0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="grid gap-[var(--cell-gap)]"
          style={{
            gridTemplateColumns: `repeat(7, var(--cell-size))`,
            gridTemplateRows: `repeat(6, var(--cell-size))`,
          }}
        >
          {board.map((row, ri) =>
            row.map((val, ci) => (
              <div
                key={`${ri}-${ci}`}
                className={`cursor-pointer transition-transform duration-75 ${
                  !disabled && board[0][ci] === 0 ? 'hover:scale-[1.03]' : 'cursor-not-allowed'
                }`}
                onClick={() => { if (!disabled && board[0][ci] === 0) onColumnClick(ci); }}
                onMouseEnter={() => { if (!disabled) onHoverCol(ci); }}
                onMouseLeave={() => onHoverCol(null)}
              >
                <Cell
                  value={val}
                  isWinning={isWinningCell(ri, ci)}
                  isAnimating={isAnimatingCell(ri, ci)}
                  isHovered={hoverCol === ci}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column numbers */}
      <div className="grid gap-[var(--cell-gap)] mt-1.5" style={{ gridTemplateColumns: `repeat(7, var(--cell-size))` }}>
        {Array.from({ length: 7 }).map((_, col) => (
          <div key={col} className="flex justify-center text-[10px] text-[#bbb] font-medium">{col + 1}</div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Board);
