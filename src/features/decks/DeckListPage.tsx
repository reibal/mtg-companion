import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { deckDeleted } from './decksSlice'
import { deckCreated } from './decksSlice'
import { NewDeckDialog } from './components/NewDeckDialog'
import { ImportDeckDialog } from './components/ImportDeckDialog'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { Deck } from '@/lib/types/deck'

export function DeckListPage() {
  const decks = useAppSelector((state) => state.decks.lists)
  const dispatch = useAppDispatch()
  const [showNew, setShowNew] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  function handleCreate(name: string, format?: Deck['format']) {
    dispatch(deckCreated({ name, format }))
    setShowNew(false)
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-text">Decks</h1>
          <p className="text-sm text-muted">Your decks and wishlists.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImport(true)}>
            <Icon name="cards" className="h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setShowNew(true)}>
            <Icon name="plus" className="h-4 w-4" />
            New deck
          </Button>
        </div>
      </header>

      {decks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-edge py-20 text-center text-sm text-faint">
          No decks yet. Create one to start building.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const size = deck.zones.main.reduce((s, e) => s + e.count, 0)
            return (
              <li key={deck.id} className="rounded-lg border border-edge bg-ink-800 transition-colors hover:border-gold/60">
                <Link to={`/decks/${deck.id}`} className="block p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate font-display text-lg text-text">{deck.name}</h2>
                    {deck.format && (
                      <span className="shrink-0 rounded-md border border-edge bg-ink-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted">
                        {deck.format}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {size} cards in mainboard
                  </p>
                </Link>
                <div className="flex items-center justify-between border-t border-edge px-5 py-2.5">
                  <span className="text-xs text-faint">
                    Updated {new Date(deck.updatedAt).toLocaleDateString()}
                  </span>
                  {confirmId === deck.id ? (
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        onClick={() => {
                          dispatch(deckDeleted(deck.id))
                          setConfirmId(null)
                        }}
                        className="px-3 py-1.5 text-xs"
                      >
                        Delete
                      </Button>
                      <Button variant="ghost" onClick={() => setConfirmId(null)} className="px-3 py-1.5 text-xs">
                        Keep
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(deck.id)}
                      aria-label={`Delete ${deck.name}`}
                      className="rounded-md p-1.5 text-faint hover:bg-ink-700 hover:text-bad"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <NewDeckDialog open={showNew} onClose={() => setShowNew(false)} onCreate={handleCreate} />
      {showImport && <ImportDeckDialog onClose={() => setShowImport(false)} />}
    </section>
  )
}