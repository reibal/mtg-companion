import { useCallback, useMemo, useState } from 'react'
import { useAutocompleteQuery, useSearchCardsInfiniteQuery } from '@/lib/scryfall'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

/** Shared typeahead + search state used by the Cards DB and the deck "add card" modal. */
export function useCardSearch() {
  const [draft, setDraft] = useState('')
  const [submitted, setSubmitted] = useState('')

  const debounced = useDebouncedValue(draft.trim(), 250)

  const { data: suggestions = [] } = useAutocompleteQuery(debounced, {
    skip: debounced.length === 0,
  })
  const search = useSearchCardsInfiniteQuery({ q: submitted }, { skip: submitted === '' })

  const cards = useMemo(
    () => search.data?.pages.flatMap((page) => page.cards) ?? [],
    [search.data],
  )

  const submit = useCallback((term: string) => {
    setDraft(term)
    setSubmitted(term.trim())
  }, [])

  const reset = useCallback(() => {
    setDraft('')
    setSubmitted('')
  }, [])

  return {
    draft,
    setDraft,
    suggestions,
    cards,
    submit,
    reset,
    isSearching: search.isLoading,
    hasSearched: submitted !== '',
    total: search.data?.pages[0]?.total ?? null,
    hasNextPage: search.hasNextPage,
    loadMore: search.fetchNextPage,
    isLoadMore: search.isFetchingNextPage,
    isError: search.isError,
  }
}