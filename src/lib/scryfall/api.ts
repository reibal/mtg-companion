import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { ScryfallCard } from '../types/card'
import type { RawCard, RawCardSearchResponse } from './raw'
import { normalizeCard } from './normalize'

const SCRYFALL_BASE_URL = 'https://api.scryfall.com'

export interface CardSearchArgs {
  q: string
}

export interface CardSearchPage {
  cards: ScryfallCard[]
  hasMore: boolean
  total: number | null
}

export const scryfallApi = createApi({
  reducerPath: 'scryfallApi',
  baseQuery: fetchBaseQuery({
    baseUrl: SCRYFALL_BASE_URL,
    headers: { Accept: 'application/json' },
  }),
  // Scryfall recommends caching fetched data for at least 24h.
  keepUnusedDataFor: 60 * 60 * 24,
  endpoints: (build) => ({
    autocomplete: build.query<string[], string>({
      query: (q) => ({ url: 'cards/autocomplete', params: { q } }),
      transformResponse: (response: { data: string[] }) => response.data,
    }),
    searchCards: build.infiniteQuery<CardSearchPage, CardSearchArgs, number>({
      query: ({ queryArg, pageParam }) => ({
        url: 'cards/search',
        params: { q: queryArg.q, page: pageParam },
      }),
      transformResponse: (response: RawCardSearchResponse) => ({
        cards: response.data.map(normalizeCard),
        hasMore: response.has_more,
        total: response.total_cards ?? null,
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage, _allPages, lastPageParam) =>
          lastPage.hasMore ? lastPageParam + 1 : undefined,
      },
    }),
    cardById: build.query<ScryfallCard, string>({
      query: (id) => ({ url: `cards/${id}` }),
      transformResponse: (raw: RawCard) => normalizeCard(raw),
    }),
    namedCard: build.query<ScryfallCard, string>({
      query: (name) => ({ url: 'cards/named', params: { fuzzy: name } }),
      transformResponse: (raw: RawCard) => normalizeCard(raw),
    }),
  }),
})

export const {
  useAutocompleteQuery,
  useSearchCardsInfiniteQuery,
  useCardByIdQuery,
  useNamedCardQuery,
} = scryfallApi