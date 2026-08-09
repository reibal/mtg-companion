import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useLazyCardByIdQuery } from '@/lib/scryfall/api'
import { CardDetailModal } from '@/components/cards/CardDetailModal'
import {
  deckRenamed,
  entryCommanderToggled,
  entryCountChanged,
  entryCountSet,
  entryMoved,
  entryRemoved,
} from './decksSlice'
import { findDeck } from './model'
import { serializeDeckText } from './export'
import { AddCardModal } from './components/AddCardModal'
import { ExportModal } from './components/ExportModal'
import { ScannerModal } from './scanner/ScannerModal'
import { DeckStatsPanel } from './components/DeckStatsPanel'
import { EntryRow } from './components/EntryRow'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { DeckZone } from '@/lib/types/deck'
import { DECK_ZONE_LABELS, DECK_ZONES } from '@/lib/types/deck'

export function DeckDetailPage() {
  const { deckId } = useParams()
  const decks = useAppSelector((state) => state.decks.lists)
  const dispatch = useAppDispatch()
  const [fetchCard, { data: selectedCard, isFetching }] = useLazyCardByIdQuery()

  const deck = findDeck(decks, deckId)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function openCard(id: string) {
    setSelectedId(id)
    fetchCard(id)
  }

  function closeCard() {
    setSelectedId(null)
  }

  if (!deck) {
    return (
      <section className="py-20 text-center">
        <p className="text-muted">Deck not found.</p>
        <Link to="/decks" className="mt-2 inline-block text-gold hover:text-gold-bright">
          Back to decks
        </Link>
      </section>
    )
  }

  const startRename = () => {
    setNameDraft(deck.name)
    setRenaming(true)
  }
  const commitRename = () => {
    const name = nameDraft.trim()
    if (name) dispatch(deckRenamed({ id: deck.id, name }))
    setRenaming(false)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <Link to="/decks" aria-label="Back to decks" className="rounded-md p-1.5 text-muted hover:bg-ink-800 hover:text-text">
          <Icon name="chevron-right" className="h-5 w-5 rotate-180" />
        </Link>
        {renaming ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitRename()
              if (event.key === 'Escape') setRenaming(false)
            }}
            className="max-w-sm flex-1 rounded-md border border-edge bg-ink-800 px-3 py-1.5 font-display text-xl text-text focus:border-gold/60"
          />
        ) : (
          <h1 className="flex items-center gap-2 font-display text-2xl text-text">
            {deck.name}
            <button
              type="button"
              onClick={startRename}
              aria-label="Rename deck"
              className="rounded-md p-1 text-faint hover:bg-ink-800 hover:text-text"
            >
              <Icon name="edit" className="h-4 w-4" />
            </button>
          </h1>
        )}
        <Button onClick={() => setAdding(true)} className="ml-auto">
          <Icon name="plus" className="h-4 w-4" />
          Add cards
        </Button>
        <Button variant="secondary" onClick={() => setScanning(true)}>
          <Icon name="scan" className="h-4 w-4" />
          Scan
        </Button>
        <Button variant="ghost" onClick={() => setExportOpen(true)}>
          <Icon name="dots" className="h-4 w-4" />
          Export
        </Button>
      </header>

      <DeckStatsPanel deck={deck} />

      <div className="space-y-6">
        {DECK_ZONES.map((zone: DeckZone) => {
          const entries = [...deck.zones[zone]].sort(
            (a, b) => (b.commander ? 1 : 0) - (a.commander ? 1 : 0),
          )
          const total = entries.reduce((sum, entry) => sum + entry.count, 0)
          return (
            <section key={zone} className="space-y-2">
              <h2 className="flex items-baseline gap-2 font-display text-lg text-text">
                {DECK_ZONE_LABELS[zone]}
                <span className="text-xs font-normal text-faint">{total} cards</span>
              </h2>
              {entries.length === 0 ? (
                <p className="rounded-md border border-dashed border-edge px-4 py-6 text-sm text-faint">
                  {zone === 'main' ? 'No cards yet — add some to start building.' : 'Empty.'}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {entries.map((entry) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      zone={zone}
                      showCommander={zone === 'main'}
                      onOpen={() => openCard(entry.id)}
                      onCountDelta={(delta) =>
                        dispatch(entryCountChanged({ deckId: deck.id, zone, entryId: entry.id, delta }))
                      }
                      onCountChange={(count) =>
                        dispatch(entryCountSet({ deckId: deck.id, zone, entryId: entry.id, count }))
                      }
                      onToggleCommander={() => dispatch(entryCommanderToggled({ deckId: deck.id, entryId: entry.id }))}
                      onMove={(target) =>
                        dispatch(entryMoved({ deckId: deck.id, from: zone, to: target, entryId: entry.id }))
                      }
                      onRemove={() => dispatch(entryRemoved({ deckId: deck.id, zone, entryId: entry.id }))}
                    />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      {adding && <AddCardModal deckId={deck.id} onClose={() => setAdding(false)} />}
      {scanning && <ScannerModal deckId={deck.id} onClose={() => setScanning(false)} />}
      {exportOpen && (
        <ExportModal
          title="Export deck"
          content={serializeDeckText(deck)}
          filename={`${deck.name}.txt`}
          onClose={() => setExportOpen(false)}
        />
      )}
      {selectedId && selectedCard && (
        <CardDetailModal card={selectedCard} onClose={closeCard} />
      )}
      {selectedId && isFetching && !selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" aria-hidden="true" />
          <p className="relative rounded-md border border-edge bg-ink-800 px-4 py-3 text-sm text-muted">
            Loading card…
          </p>
        </div>
      )}
    </section>
  )
}