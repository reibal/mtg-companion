import { useState } from 'react'
import type { ScryfallCard } from '@/lib/types/card'
import { useCardSearch } from '@/hooks/useCardSearch'
import { CardSearchInput } from '@/components/cards/CardSearchInput'
import { CardGrid } from '@/components/cards/CardGrid'
import { CardGridSkeleton } from '@/components/cards/CardGridSkeleton'
import { CardDetail } from '@/components/cards/CardDetail'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const QUICK_STARTERS = ['Lightning Bolt', 'Sol Ring', 'Counterspell', 'Ragavan, Nimble Pilferer']

export function CardsPage() {
  const search = useCardSearch()
  const [selected, setSelected] = useState<ScryfallCard | null>(null)

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl text-text">Cards Database</h1>
        <p className="text-sm text-muted">Search any Magic card and read its full rules text.</p>
      </header>

      <CardSearchInput
        value={search.draft}
        onValueChange={search.setDraft}
        suggestions={search.suggestions}
        onSubmit={search.submit}
        placeholder="Search a Magic card…"
      />

      {!search.hasSearched && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-faint">Try:</span>
          {QUICK_STARTERS.map((term) => (
            <Button key={term} variant="secondary" onClick={() => search.submit(term)} className="px-3 py-1.5 text-xs">
              {term}
            </Button>
          ))}
        </div>
      )}

      {search.hasSearched && search.isError && (
        <div className="rounded-md border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
          Something went wrong while searching. Check your connection and try again.
        </div>
      )}

      {search.isSearching && search.cards.length === 0 && <CardGridSkeleton />}

      {search.hasSearched && !search.isSearching && search.cards.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">No cards found for “{search.draft}”.</p>
      )}

      {search.cards.length > 0 && (
        <>
          <CardGrid cards={search.cards} onSelect={setSelected} />
          {search.hasNextPage && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={search.loadMore} disabled={search.isLoadMore}>
                {search.isLoadMore ? 'Loading…' : 'Load more'}
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