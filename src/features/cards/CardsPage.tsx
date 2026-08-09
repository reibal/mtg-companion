import { useState } from 'react'
import { useAutocompleteQuery, useSearchCardsInfiniteQuery } from '@/lib/scryfall'
import type { ScryfallCard } from '@/lib/types/card'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { CardSearchInput } from '@/components/cards/CardSearchInput'
import { CardGrid } from '@/components/cards/CardGrid'
import { CardGridSkeleton } from '@/components/cards/CardGridSkeleton'
import { CardDetail } from '@/components/cards/CardDetail'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const QUICK_STARTERS = ['Lightning Bolt', 'Sol Ring', 'Counterspell', 'Ragavan, Nimble Pilferer']

export function CardsPage() {
  const [draft, setDraft] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [selected, setSelected] = useState<ScryfallCard | null>(null)

  const query = draft.trim()
  const debounced = useDebouncedValue(query, 250)

  const { data: suggestions = [] } = useAutocompleteQuery(debounced, {
    skip: debounced.length === 0,
  })

  const search = useSearchCardsInfiniteQuery({ q: submitted }, { skip: submitted === '' })

  const cards = search.data?.pages.flatMap((page) => page.cards) ?? []
  const total = search.data?.pages[0]?.total ?? null

  const handleSubmit = (term: string) => {
    setDraft(term)
    setSubmitted(term.trim())
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl text-text">Cards Database</h1>
        <p className="text-sm text-muted">Search any Magic card and read its full rules text.</p>
      </header>

      <CardSearchInput
        value={draft}
        onValueChange={setDraft}
        suggestions={suggestions}
        onSubmit={handleSubmit}
        placeholder="Search a Magic card…"
      />

      {submitted === '' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-faint">Try:</span>
          {QUICK_STARTERS.map((term) => (
            <Button key={term} variant="secondary" onClick={() => handleSubmit(term)} className="px-3 py-1.5 text-xs">
              {term}
            </Button>
          ))}
        </div>
      )}

      {submitted !== '' && search.isError && (
        <div className="rounded-md border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
          Something went wrong while searching. Check your connection and try again.
        </div>
      )}

      {submitted !== '' && search.isLoading && <CardGridSkeleton />}

      {submitted !== '' && !search.isLoading && cards.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">No cards found for “{submitted}”.</p>
      )}

      {cards.length > 0 && (
        <>
          <CardGrid cards={cards} onSelect={setSelected} />
          <p className="text-xs text-faint">
            {total !== null ? `${total} cards` : 'Results'}
            {cards.length > 0 ? ` · showing ${cards.length}` : ''}
          </p>
          {search.hasNextPage && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={search.fetchNextPage} disabled={search.isFetchingNextPage}>
                {search.isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <CardDetail card={selected} />
        </Modal>
      )}
    </section>
  )
}