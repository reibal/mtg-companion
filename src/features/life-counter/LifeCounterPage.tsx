import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { gameEnded, gameStarted, lifeChanged, playerNameChanged } from './gameSlice'
import { StartScreen } from './components/StartScreen'
import { PlayerPanel } from './components/PlayerPanel'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { GameMode } from '@/lib/types/game'
import { STARTING_LIFE } from '@/lib/types/game'

export function LifeCounterPage() {
  const dispatch = useAppDispatch()
  const game = useAppSelector((state) => state.game)
  const [confirmEnd, setConfirmEnd] = useState(false)

  if (game.players.length === 0) {
    return <StartScreen onStart={(mode: GameMode, count: number) => dispatch(gameStarted({ mode, count }))} />
  }

  const gridClass = game.players.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'sm:grid-cols-2'

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl text-text">Life Counter</h1>
          <p className="text-xs uppercase tracking-wide text-faint">
            {game.mode} · {STARTING_LIFE[game.mode]} starting life
          </p>
        </div>
        <div className="ml-auto">
          <Button variant="danger" onClick={() => setConfirmEnd(true)}>
            End game
          </Button>
        </div>
      </header>

      <div className={`grid ${gridClass} gap-4`}>
        {game.players.map((player) => (
          <PlayerPanel
            key={player.id}
            player={player}
            onNameChange={(name) => dispatch(playerNameChanged({ id: player.id, name }))}
            onLifeDelta={(delta) => dispatch(lifeChanged({ id: player.id, delta }))}
          />
        ))}
      </div>

      {confirmEnd && (
        <Modal title="End game" onClose={() => setConfirmEnd(false)}>
          <div className="space-y-4">
            <p className="text-sm text-muted">
              This will discard all current life totals and return to the setup screen. Are you sure
              you want to end the game?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmEnd(false)}>
                Keep playing
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  dispatch(gameEnded())
                  setConfirmEnd(false)
                }}
              >
                End game
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}