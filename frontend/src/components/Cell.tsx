/**
 * Cell.tsx — A single cell in the Connect Four board
 * 
 * Renders as a circular slot that can be:
 *  - Empty (dark recessed look)
 *  - Player disc (red with gradient)
 *  - AI disc (yellow with gradient)
 *  - Winning cell (pulsing glow)
 *  - Animating (drop animation)
 */

import React from 'react';

interface CellProps {
  value: number;       // 0 = empty, 1 = player, 2 = AI
  isWinning: boolean;  // Part of the winning 4?
  isAnimating: boolean; // Currently animating a disc drop?
  isHovered: boolean;  // Column is being hovered?
}

const Cell: React.FC<CellProps> = ({ value, isWinning, isAnimating, isHovered }) => {
  let slotClass = 'board-slot board-slot-empty';

  if (value === 1) {
    slotClass = 'board-slot board-slot-player';
  } else if (value === 2) {
    slotClass = 'board-slot board-slot-ai';
  }

  // Add animation class for disc dropping
  if (isAnimating && value !== 0) {
    slotClass += ' disc-animate';
  }

  // Add winning pulse animation
  if (isWinning) {
    slotClass += ' win-cell';
  }

  // Add hover glow for empty cells in hovered column
  if (isHovered && value === 0) {
    slotClass += ' column-hover';
  }

  return (
    <div
      className={slotClass}
      style={{
        width: 'var(--cell-size)',
        height: 'var(--cell-size)',
      }}
    />
  );
};

export default React.memo(Cell);
