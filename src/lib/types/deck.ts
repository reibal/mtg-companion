import type { CardColor } from './card'

export type DeckZone = 'main' | 'side' | 'consider'

export const DECK_ZONES: DeckZone[] = ['main', 'side', 'consider']

export const DECK_ZONE_LABELS: Record<DeckZone, string> = {
  main: 'Mainboard',
  side: 'Sideboard',
  consider: 'Considering',
}

export const DECK_FORMATS = ['commander', 'standard', 'modern', 'pioneer', 'pauper', 'casual'] as const
export type DeckFormat = (typeof DECK_FORMATS)[number]

/** Light card snapshot stored with each deck entry — fast to render, no refetch needed. */
export interface DeckCard {
  id: string
  name: string
  image?: string
  cmc?: number
  colors?: CardColor[]
}

export interface DeckEntry extends DeckCard {
  count: number
  /** Only meaningful in the `main` zone; at most 2 per deck. */
  commander?: boolean
}

export interface Deck {
  id: string
  name: string
  format?: DeckFormat
  createdAt: number
  updatedAt: number
  zones: Record<DeckZone, DeckEntry[]>
}

export function createEmptyDeck(id: string, name: string, format?: DeckFormat): Deck {
  const now = Date.now()
  return {
    id,
    name,
    format,
    createdAt: now,
    updatedAt: now,
    zones: { main: [], side: [], consider: [] },
  }
}