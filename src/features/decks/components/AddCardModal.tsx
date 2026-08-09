import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CardSearchInput } from '@/components/cards/CardSearchInput'
import { CardGrid } from '@/components/cards/CardGrid'
import { CardGridSkeleton } from '@/components/cards/CardGridSkeleton'
import type { ScryfallCard } from '@/lib/types/card'
import type { DeckZone } from '@/lib/types/deck'
import { DECK_ZONE_LABELS, DECK_ZONES } from '@/lib/types/deck'
import { useCardSearch } from '@/hooks/useCardSearch'
import { entryAdded } from '../decksSlice'
import { toDeckCard } from '../model'
import { useAppDispatch } from '@/app/hooks'

type Props = {
  deckId: string
  onClose: () => void
}

export function AddCardModal({ deckId, onClose }: Props) {
  const dispatch = useAppDispatch()
  const [zone, setZone] = useState<DeckZone>('main')
  const search = useCardSearch()

  function handleAdd(card: ScryfallCard) {
    dispatch(entryAdded({ deckId, zone, card: toDeckCard(card) }))
    onClose()
  }

  return (
    <Modal title="Add cards" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Add to:</span>
          {DECK_ZONES.map((candidate: DeckZone) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setZone(candidate)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                zone === candidate
                  ? 'bg-gold text-ink-950'
                  : 'border border-edge bg-ink-700 text-muted hover:text-text'
              }`}
            >
              {DECK_ZONE_LABELS[candidate]}
            </button>
          ))}
        </div>

        <CardSearchInput
          value={search.draft}
          onValueChange={search.setDraft}
          suggestions={search.suggestions}
          onSubmit={search.submit}
          placeholder={zone === 'main' ? 'Add cards to the mainboard…' : `Add cards to the ${DECK_ZONE_LABELS[zone].toLowerCase()}…`}
        />

        {search.isSearching && search.cards.length === 0 && <CardGridSkeleton />}

        {search.hasSearched && !search.isSearching && search.cards.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">No cards found for “{search.draft}”.</p>
        )}

        {search.isError && (
          <p className="rounded-md border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
            Something went wrong while searching.
          </p>
        )}

        {search.cards.length > 0 && (
          <CardGrid cards={search.cards} onSelect={handleAdd} />
        )}

        {search.hasNextPage && (
          <div className="flex justify-center">
            <Button variant="secondary" onClick={search.loadMore} disabled={search.isLoadMore}>
              {search.isLoadMore ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}

        <p className="text-xs text-faint">Click a card to add one copy. Up to two commanders can be marked in the deck.</p>
      </div>
    </Modal>
  )
}