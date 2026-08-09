import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  commanderDamageChanged,
  gameStarted,
  lifeChanged,
  lifeSet,
  playerAdded,
  playerNameChanged,
  playerRemoved,
  poisonChanged,
} from './gameSlice'
import { StartScreen } from './components/StartScreen'
import { PlayerPanel } from './components/PlayerPanel'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { GameMode } from '@/lib/types/game'
import { MAX_PLAYERS, MIN_PLAYERS, STARTING_LIFE } from '@/lib/types/game'

export function LifeCounterPage() {
  const dispatch = useAppDispatch()
  const game = useAppSelector((state) => state.game)

  if (game.players.length === 0) {
    return <StartScreen onStart={(mode: GameMode, count: number) => dispatch(gameStarted({ mode, count }))} />
  }

  const gridClass = game.players.length === 2 ? 'grid-cols-1' : 'sm:grid-cols-2'

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl text-text">Life Counter</h1>
          <p className="text-xs uppercase tracking-wide text-faint">
            {game.mode} · {STARTING_LIFE[game.mode]} starting life
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {game.players.length < MAX_PLAYERS && (
            <Button variant="secondary" onClick={() => dispatch(playerAdded())}>
              <Icon name="plus" className="h-4 w-4" />
              Player
            </Button>
          )}
          <Button onClick={() => dispatch(gameStarted({ mode: game.mode, count: game.players.length }))}>
            New game
          </Button>
        </div>
      </header>

      <div className={`grid ${gridClass} gap-3`}>
        {game.players.map((player) => (
          <PlayerPanel
            key={player.id}
            player={player}
            mode={game.mode}
            otherPlayers={game.players.filter((candidate) => candidate.id !== player.id)}
            onNameChange={(name) => dispatch(playerNameChanged({ id: player.id, name }))}
            onLifeDelta={(delta) => dispatch(lifeChanged({ id: player.id, delta }))}
            onLifeSet={(value) => dispatch(lifeSet({ id: player.id, value }))}
            onPoisonDelta={(delta) => dispatch(poisonChanged({ id: player.id, delta }))}
            onCommanderDamageDelta={(attackerId, delta) =>
              dispatch(commanderDamageChanged({ fromId: attackerId, toId: player.id, delta }))
            }
            onRemove={() => dispatch(playerRemoved(player.id))}
            canRemove={game.players.length > MIN_PLAYERS}
          />
        ))}
      </div>
    </section>
  )
}