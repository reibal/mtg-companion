import type { Deck, DeckCard, DeckEntry, DeckZone } from '@/lib/types/deck'
import type { ScryfallCard, CardColor } from '@/lib/types/card'

/** Project a search/solved card into the lightweight snapshot a deck entry stores. */
export function toDeckCard(card: ScryfallCard): DeckCard {
  return {
    id: card.id,
    name: card.name,
    image: card.imageUris?.normal ?? card.cardFaces?.[0]?.imageUris?.normal,
    cmc: card.cmc,
    colors: card.colors,
  }
}

export function entryCount(entries: DeckEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.count, 0)
}

export function commanderEntries(deck: Deck): DeckEntry[] {
  return deck.zones.main.filter((entry) => entry.commander)
}

export function findDeck(decks: Deck[], id: string | undefined): Deck | undefined {
  return decks.find((deck) => deck.id === id)
}

export interface DeckStats {
  deckSize: number
  totalSize: number
  zoneCounts: Record<DeckZone, number>
  commanders: DeckEntry[]
  colorIdentity: CardColor[]
  curve: { cmc: number; copies: number }[]
}

const COLOR_ORDER: CardColor[] = ['W', 'U', 'B', 'R', 'G']

export function computeDeckStats(deck: Deck): DeckStats {
  const zoneCounts: Record<DeckZone, number> = {
    main: entryCount(deck.zones.main),
    side: entryCount(deck.zones.side),
    consider: entryCount(deck.zones.consider),
  }

  const identity = new Set<CardColor>()
  const byCmc = new Map<number, number>()

  for (const entry of deck.zones.main) {
    if (entry.colors) {
      for (const color of entry.colors) identity.add(color)
    }
    const cmc = entry.cmc ?? 0
    byCmc.set(cmc, (byCmc.get(cmc) ?? 0) + entry.count)
  }
  for (const entry of deck.zones.side) {
    entry.colors?.forEach((color) => identity.add(color))
  }

  const curve = [...byCmc.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cm, copies]) => ({ cmc: cm, copies }))

  return {
    deckSize: zoneCounts.main,
    totalSize: zoneCounts.main + zoneCounts.side + zoneCounts.consider,
    zoneCounts,
    commanders: commanderEntries(deck),
    colorIdentity: COLOR_ORDER.filter((color) => identity.has(color)),
    curve,
  }
}