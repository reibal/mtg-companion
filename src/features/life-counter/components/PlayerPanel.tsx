import { useState } from 'react'
import type { GameMode, Player } from '@/lib/types/game'
import { Icon } from '@/components/ui/Icon'

type Props = {
  player: Player
  mode: GameMode
  otherPlayers: Player[]
  onNameChange: (name: string) => void
  onLifeDelta: (delta: number) => void
  onLifeSet: (value: number) => void
  onPoisonDelta: (delta: number) => void
  onCommanderDamageDelta: (attackerId: string, delta: number) => void
  onRemove: () => void
  canRemove: boolean
}

function lifeTone(life: number) {
  if (life <= 5) return 'text-bad'
  if (life <= 10) return 'text-gold'
  return 'text-text'
}

function BigButton({
  label,
  onClick,
  large = false,
  danger = false,
}: {
  label: string
  onClick: () => void
  large?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-md font-semibold transition active:scale-95 ${
        large ? 'px-2 py-3 text-3xl' : 'px-4 py-2.5 text-2xl'
      } ${danger ? 'bg-bad/15 text-bad hover:bg-bad/25' : 'bg-ink-700 text-text hover:bg-ink-600'}`}
    >
      {label}
    </button>
  )
}

export function PlayerPanel({
  player,
  mode,
  otherPlayers,
  onNameChange,
  onLifeDelta,
  onLifeSet,
  onPoisonDelta,
  onCommanderDamageDelta,
  onRemove,
  canRemove,
}: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(player.name)
  const [editingLife, setEditingLife] = useState(false)
  const [lifeDraft, setLifeDraft] = useState(String(player.life))

  const commitName = () => {
    onNameChange(nameDraft)
    setEditingName(false)
  }
  const commitLife = () => {
    const value = Number.parseInt(lifeDraft, 10)
    if (Number.isFinite(value)) onLifeSet(value)
    setEditingLife(false)
  }

  return (
    <article className="flex min-h-72 flex-col overflow-hidden rounded-xl border border-edge bg-ink-800">
      <header className="flex items-center justify-between gap-2 border-b border-edge px-4 py-2.5">
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitName()
              if (event.key === 'Escape') setEditingName(false)
            }}
            aria-label="Player name"
            className="min-w-0 flex-1 rounded-md border border-edge bg-ink-700 px-2 py-1 text-sm text-text focus:border-gold/60"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(player.name)
              setEditingName(true)
            }}
            title="Rename player"
            className="max-w-full truncate text-sm font-medium text-text hover:text-gold"
          >
            {player.name}
          </button>
        )}
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${player.name}`}
            className="shrink-0 rounded-md p-1.5 text-faint hover:bg-ink-700 hover:text-bad"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-4">
        {editingLife ? (
          <input
            autoFocus
            value={lifeDraft}
            onChange={(event) => setLifeDraft(event.target.value)}
            onBlur={commitLife}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitLife()
              if (event.key === 'Escape') setEditingLife(false)
            }}
            inputMode="numeric"
            aria-label="Life total"
            className="w-28 rounded-md border border-edge bg-ink-700 px-3 py-1 text-center font-display text-4xl text-text focus:border-gold/60"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setLifeDraft(String(player.life))
              setEditingLife(true)
            }}
            title="Edit life total"
            className={`font-display text-6xl leading-none tabular-nums ${lifeTone(player.life)}`}
          >
            {player.life}
          </button>
        )}

        <div className="flex w-full items-stretch gap-2">
          <BigButton label="−5" onClick={() => onLifeDelta(-5)} danger />
          <BigButton label="−1" large onClick={() => onLifeDelta(-1)} danger />
          <BigButton label="+1" large onClick={() => onLifeDelta(1)} />
          <BigButton label="+5" onClick={() => onLifeDelta(5)} />
        </div>
      </div>

      <div className="space-y-2 border-t border-edge px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-faint">Poison</span>
          <span className="text-sm font-semibold text-text">{player.poison}</span>
          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => onPoisonDelta(-1)}
              aria-label="Decrease poison"
              className="rounded-md bg-ink-700 px-3 py-1 text-lg leading-none text-muted hover:bg-ink-600 hover:text-text"
            >
              −1
            </button>
            <button
              type="button"
              onClick={() => onPoisonDelta(1)}
              aria-label="Increase poison"
              className="rounded-md bg-ink-700 px-3 py-1 text-lg leading-none text-muted hover:bg-ink-600 hover:text-text"
            >
              +1
            </button>
          </div>
        </div>

        {mode === 'commander' && otherPlayers.length > 0 && (
          <div className="space-y-1.5 border-t border-edge pt-2">
            <p className="text-xs uppercase tracking-wide text-faint">Commander damage</p>
            {otherPlayers.map((other) => {
              const dealt = player.commanderDamage[other.id] ?? 0
              return (
                <div key={other.id} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-muted">{other.name}</span>
                  <span className="tabular-nums text-text">{dealt}</span>
                  <button
                    type="button"
                    onClick={() => onCommanderDamageDelta(other.id, -1)}
                    aria-label={`Undo ${other.name}'s commander damage`}
                    className="rounded-md bg-ink-700 px-2 py-0.5 text-muted hover:bg-ink-600 hover:text-text"
                  >
                    −1
                  </button>
                  <button
                    type="button"
                    onClick={() => onCommanderDamageDelta(other.id, 1)}
                    aria-label={`${other.name} dealt commander damage`}
                    className="rounded-md bg-ink-700 px-2 py-0.5 text-muted hover:bg-ink-600 hover:text-text"
                  >
                    +1
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </article>
  )
}