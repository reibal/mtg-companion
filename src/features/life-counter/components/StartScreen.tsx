import { useState } from 'react'
import type { GameMode } from '@/lib/types/game'
import { MAX_PLAYERS, MIN_PLAYERS, STARTING_LIFE } from '@/lib/types/game'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

type Props = { onStart: (mode: GameMode, count: number) => void }

const MODES: { mode: GameMode; label: string; blurb: string }[] = [
  { mode: 'standard', label: 'Standard', blurb: 'Two players, 20 life.' },
  { mode: 'commander', label: 'Commander', blurb: 'Up to four players, 40 life, commander damage.' },
]

export function StartScreen({ onStart }: Props) {
  const [mode, setMode] = useState<GameMode>('commander')
  const [count, setCount] = useState(2)

  return (
    <section className="mx-auto max-w-2xl space-y-6 py-8">
      <header className="space-y-1 text-center">
        <h1 className="font-display text-2xl text-text">Life Counter</h1>
        <p className="text-sm text-muted">Set up the table and start tracking.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => setMode(option.mode)}
            className={`rounded-xl border p-5 text-left transition-colors ${
              mode === option.mode
                ? 'border-gold/70 bg-gold/10'
                : 'border-edge bg-ink-800 hover:border-gold/40'
            }`}
          >
            <h2 className="font-display text-lg text-text">{option.label}</h2>
            <p className="mt-1 text-sm text-muted">{option.blurb}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-faint">
              Starting life {STARTING_LIFE[option.mode]}
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-sm text-muted">Players</span>
        <Button
          variant="secondary"
          onClick={() => setCount((c) => Math.max(MIN_PLAYERS, c - 1))}
          disabled={count <= MIN_PLAYERS}
        >
          <Icon name="minus" className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-display text-2xl text-text">{count}</span>
        <Button
          variant="secondary"
          onClick={() => setCount((c) => Math.min(MAX_PLAYERS, c + 1))}
          disabled={count >= MAX_PLAYERS}
        >
          <Icon name="plus" className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center">
        <Button onClick={() => onStart(mode, count)} className="px-8 py-3 text-base">
          Start game
        </Button>
      </div>
    </section>
  )
}