import { useState } from 'react'
import type { DeckEntry, DeckZone } from '@/lib/types/deck'
import { DECK_ZONE_LABELS, DECK_ZONES } from '@/lib/types/deck'
import { MANA_COLORS } from '@/lib/types/card'
import { Icon } from '@/components/ui/Icon'
import { Menu, MenuButton } from '@/components/ui/Menu'

type Props = {
  entry: DeckEntry
  zone: DeckZone
  showCommander: boolean
  onOpen: () => void
  onCountDelta: (delta: number) => void
  onCountChange: (count: number) => void
  onToggleCommander: () => void
  onMove: (target: DeckZone) => void
  onRemove: () => void
}

export function EntryRow({
  entry,
  zone,
  showCommander,
  onOpen,
  onCountDelta,
  onCountChange,
  onToggleCommander,
  onMove,
  onRemove,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isCommander = entry.commander ?? false
  const moves = DECK_ZONES.filter((target) => target !== zone)

  return (
    <li
      className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
        isCommander
          ? 'border-arcane/50 bg-arcane/10'
          : 'border-edge bg-ink-800'
      }`}
    >
      {entry.image ? (
        <button type="button" onClick={onOpen} aria-label={`View ${entry.name}`} className="shrink-0">
          <img
            src={entry.image}
            alt=""
            loading="lazy"
            className="h-14 w-10 shrink-0 rounded-[3px] object-cover transition-opacity hover:opacity-80"
          />
        </button>
      ) : (
        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-[3px] bg-ink-700 text-[9px] text-faint">
          {entry.name}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <p className="truncate text-sm text-text hover:text-gold" title={entry.name}>
            {entry.name}
          </p>
        </button>
        <div className="mt-0.5 flex items-center gap-1.5">
          {entry.colors?.map((color) => (
            <span
              key={color}
              className="size-3 rounded-full"
              title={color}
              style={{ backgroundColor: MANA_COLORS[color] }}
            />
          ))}
          {entry.cmc !== undefined && <span className="text-xs text-faint">CMC {entry.cmc}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {showCommander && (
          <button
            type="button"
            onClick={onToggleCommander}
            aria-pressed={entry.commander ?? false}
            title="Mark as commander"
            className={`rounded-md p-1.5 transition-colors ${
              entry.commander ? 'bg-arcane/20 text-arcane' : 'text-faint hover:bg-ink-700 hover:text-text'
            }`}
          >
            <Icon name="crown" className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onCountDelta(-1)}
          aria-label={`Decrease ${entry.name}`}
          className="rounded-md p-1.5 text-muted hover:bg-ink-700 hover:text-text"
        >
          <Icon name="minus" className="h-4 w-4" />
        </button>
        <input
          type="number"
          min={1}
          value={entry.count}
          onChange={(event) => onCountChange(Number(event.target.value))}
          aria-label={`Count of ${entry.name}`}
          className="w-10 rounded-md border border-edge bg-ink-700 py-1 text-center text-sm text-text [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onCountDelta(1)}
          aria-label={`Increase ${entry.name}`}
          className="rounded-md p-1.5 text-muted hover:bg-ink-700 hover:text-text"
        >
          <Icon name="plus" className="h-4 w-4" />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={`Options for ${entry.name}`}
            aria-expanded={menuOpen}
            className="rounded-md p-1.5 text-faint hover:bg-ink-700 hover:text-text"
          >
            <Icon name="dots" className="h-4 w-4" />
          </button>
          {menuOpen && (
            <Menu onClose={() => setMenuOpen(false)} align="right">
              {moves.map((target) => (
                <MenuButton key={target} onClick={() => { onMove(target); setMenuOpen(false) }}>
                  Move to {DECK_ZONE_LABELS[target]}
                </MenuButton>
              ))}
              <MenuButton danger onClick={() => { onRemove(); setMenuOpen(false) }}>
                Delete
              </MenuButton>
            </Menu>
          )}
        </div>
      </div>
    </li>
  )
}