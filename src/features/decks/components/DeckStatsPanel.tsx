import type { Deck, DeckZone } from '@/lib/types/deck'
import { DECK_ZONE_LABELS, DECK_ZONES } from '@/lib/types/deck'
import { MANA_COLORS } from '@/lib/types/card'
import { computeDeckStats, type DeckStats } from '../model'

type Props = { deck: Deck }

export function DeckStatsPanel({ deck }: Props) {
  const stats: DeckStats = computeDeckStats(deck)
  const maxCopies = Math.max(1, ...stats.curve.map((item) => item.copies))

  return (
    <div className="rounded-xl border border-edge bg-ink-800 p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {deck.format && (
          <span className="rounded-md border border-edge bg-ink-700 px-2.5 py-0.5 text-xs uppercase tracking-wide text-muted">
            {deck.format}
          </span>
        )}
        {DECK_ZONES.map((zone: DeckZone) => (
          <span key={zone} className="text-xs text-muted">
            {DECK_ZONE_LABELS[zone]}:{' '}
            <span className="font-semibold text-text">{stats.zoneCounts[zone]}</span>
          </span>
        ))}
      </div>

      {stats.commanders.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-faint">Commanders</span>
          {stats.commanders.map((entry) => (
            <span
              key={entry.id}
              className="rounded-md border border-arcane/40 bg-arcane/10 px-2 py-0.5 text-sm text-text"
            >
              {entry.name}
            </span>
          ))}
        </div>
      )}

      {stats.colorIdentity.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-faint">Identity</span>
          {stats.colorIdentity.map((color) => (
            <span
              key={color}
              className="size-3 rounded-full"
              title={color}
              style={{ backgroundColor: MANA_COLORS[color] }}
            />
          ))}
        </div>
      )}

      {stats.curve.length > 0 && (
        <div className="mt-4 space-y-1">
          <p className="text-xs uppercase tracking-wide text-faint">Mana curve</p>
          {stats.curve.map((item) => (
            <div key={item.cmc} className="flex items-center gap-2 text-xs">
              <span className="w-5 text-muted">{item.cmc}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${(item.copies / maxCopies) * 100}%` }}
                />
              </div>
              <span className="w-5 text-right text-faint">{item.copies}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}