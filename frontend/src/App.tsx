/**
 * App.tsx — Root component for Connect Four AI
 */

import './index.css';
import Board from './components/Board';
import Controls from './components/Controls';
import StatusBar from './components/StatusBar';
import { useGame } from './hooks/useGame';

function App() {
  const game = useGame();
  const isDisabled = game.status !== 'playing' || game.isThinking;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Top bar */}
      <nav className="w-full border-b border-[#e8e8e8] bg-white px-6 py-4 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#d63031]" />
              <span className="w-3 h-3 rounded-full bg-[#fdcb6e]" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#1a1a2e]">Connect Four</h1>
          </div>
          <span className="text-xs text-[#9ca3af] font-medium hidden sm:block">Minimax · Alpha-Beta Pruning</span>
        </div>
      </nav>

      {/* Main — centered */}
      <main className="flex-1 flex px-4 sm:px-8 py-8 lg:py-12 items-center justify-center">
        {/* We use CSS Grid explicitly so the board column and controls column never overlap */}
        <div className="grid grid-cols-1 lg:grid-cols-[min-content_320px] xl:grid-cols-[min-content_340px] gap-10 lg:gap-14 xl:gap-20 justify-center w-full max-w-6xl mx-auto">
          
          {/* LEFT — Board + Status */}
          <div className="flex flex-col items-center gap-5 justify-self-center lg:justify-self-end">
            <Board
              board={game.board}
              winningCells={game.winningCells}
              animatingCells={game.animatingCells}
              hoverCol={game.hoverCol}
              disabled={isDisabled}
              onColumnClick={game.handleColumnClick}
              onHoverCol={game.setHoverCol}
            />
            <StatusBar
              status={game.status}
              isThinking={game.isThinking}
              winner={game.winner}
              currentTurn={game.currentTurn}
              moveCount={game.moveCount}
              gameMode={game.gameMode}
              pvpTurn={game.pvpTurn}
            />
          </div>

          {/* RIGHT — Single unified card with controls + algorithm */}
          <div className="w-full max-w-md lg:max-w-none bg-white rounded-3xl border border-[#e8e8e8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-fit justify-self-center lg:justify-self-start">

            {/* Controls section */}
            <div className="px-7 sm:px-10 pt-10 pb-10">
              <Controls
                difficulty={game.difficulty}
                gameMode={game.gameMode}
                onDifficultyChange={game.setDifficulty}
                onGameModeChange={game.setGameMode}
                onReset={game.handleReset}
                disabled={game.isThinking}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-[#f0f0f0] w-full" />

            {/* Algorithm section */}
            <div className="px-7 sm:px-10 py-10 bg-[#fafafa]/80">
              <h3 className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.16em] mb-5">Algorithm</h3>
              <div className="space-y-5 text-[13.5px] text-[#6b7280] leading-[1.8]">
                <p><span className="font-semibold text-[#1a1a2e]">Minimax</span> — recursively evaluates all possible future moves, maximizing AI advantage while assuming optimal opponent play.</p>
                <p><span className="font-semibold text-[#1a1a2e]">Alpha-Beta Pruning</span> — eliminates branches that cannot influence the final decision, reducing computation by up to 50%.</p>
                <p><span className="font-semibold text-[#1a1a2e]">Heuristic</span> — scores positions by 4-in-a-row windows (+100 win, +10 three-in-row, center bonus, blocking).</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#bbb] py-3 border-t border-[#e8e8e8] shrink-0">
        React · TypeScript · Node.js · Express — Portfolio Project
      </footer>
    </div>
  );
}

export default App;
