import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { ScryfallCard } from '../types/card'
import type { RawCard, RawCardSearchResponse } from './raw'
import { normalizeCard } from './normalize'

const SCRYFALL_BASE_URL = 'https://api.scryfall.com'
const COLLECTION_CHUNK_SIZE = 75

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
    /**
     * Resolve many card *names* at once via `/cards/collection` (≤75 per POST,
     * chunked internally). Returns resolved cards in input order plus names
     * Scryfall couldn't match exactly.
     */
    resolveCards: build.mutation<
      { cards: ScryfallCard[]; missing: string[] },
      string[]
    >({
      async queryFn(names, _api, _extraOptions, baseQuery) {
        const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))]
        const cards: ScryfallCard[] = []
        const missing: string[] = []

        for (let offset = 0; offset < unique.length; offset += COLLECTION_CHUNK_SIZE) {
          const chunk = unique.slice(offset, offset + COLLECTION_CHUNK_SIZE)
          const result = await baseQuery({
            url: 'cards/collection',
            method: 'POST',
            body: { identifiers: chunk.map((name) => ({ name: lookupName(name) })) },
          })
          if (result.error) {
            return { error: result.error }
          }
          const body = result.data as {
            data?: RawCard[]
            not_found?: { name?: string }[] | string[]
          }
          cards.push(...(body.data ?? []).map(normalizeCard))
          for (const item of body.not_found ?? []) {
            missing.push(typeof item === 'string' ? item : (item.name ?? ''))
          }
        }

        return { data: { cards, missing } }
      },
    }),
  }),
})

/**
 * Scryfall's `/cards/collection` name match rejects the `//` full name of
 * double-faced cards but accepts the front-face name. Strip the back face for
 * the lookup so MDFCs resolve.
 */
function lookupName(name: string): string {
  const marker = name.indexOf(' // ')
  return marker === -1 ? name : name.slice(0, marker)
}

export const {
  useAutocompleteQuery,
  useSearchCardsInfiniteQuery,
  useCardByIdQuery,
  useLazyCardByIdQuery,
  useNamedCardQuery,
  useLazyNamedCardQuery,
  useResolveCardsMutation,
} = scryfallApi