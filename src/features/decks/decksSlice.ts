import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Deck, DeckCard, DeckZone } from '@/lib/types/deck'
import { createEmptyDeck } from '@/lib/types/deck'
import { loadJSON } from '@/lib/storage'
import { localStoragePort, storageKeys } from '@/lib/storage'

import type { DeckFormat } from '@/lib/types/deck'

interface DecksState {
  lists: Deck[]
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Hydrate persisted decks at module load (best-effort). */
const persisted = loadJSON<Deck[]>(localStoragePort, storageKeys.decks)
const initialState: DecksState = { lists: persisted ?? [] }

const decksSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    deckCreated(state, action: PayloadAction<{ name: string; format?: DeckFormat }>) {
      const { name, format } = action.payload
      state.lists.push(createEmptyDeck(makeId(), name, format))
    },
    deckRenamed(state, action: PayloadAction<{ id: string; name: string }>) {
      const deck = state.lists.find((d) => d.id === action.payload.id)
      if (!deck) return
      deck.name = action.payload.name
      deck.updatedAt = Date.now()
    },
    deckDeleted(state, action: PayloadAction<string>) {
      const index = state.lists.findIndex((d) => d.id === action.payload)
      if (index !== -1) state.lists.splice(index, 1)
    },
    entryAdded(state, action: PayloadAction<{ deckId: string; zone: DeckZone; card: DeckCard }>) {
      const deck = state.lists.find((d) => d.id === action.payload.deckId)
      if (!deck) return
      const { zone, card } = action.payload
      const entry = deck.zones[zone].find((candidate) => candidate.id === card.id)
      if (entry) {
        entry.count += 1
      } else {
        deck.zones[zone].push({ ...card, count: 1 })
      }
      deck.updatedAt = Date.now()
    },
    entryRemoved(state, action: PayloadAction<{ deckId: string; zone: DeckZone; entryId: string }>) {
      const { deckId, zone, entryId } = action.payload
      const deck = state.lists.find((d) => d.id === deckId)
      if (!deck) return
      const entries = deck.zones[zone]
      const index = entries.findIndex((entry) => entry.id === entryId)
      if (index !== -1) {
        entries.splice(index, 1)
        deck.updatedAt = Date.now()
      }
    },
    entryCountChanged(
      state,
      action: PayloadAction<{ deckId: string; zone: DeckZone; entryId: string; delta: number }>,
    ) {
      const { deckId, zone, entryId, delta } = action.payload
      const deck = state.lists.find((d) => d.id === deckId)
      if (!deck) return
      const entry = deck.zones[zone].find((candidate) => candidate.id === entryId)
      if (!entry) return
      const next = entry.count + delta
      if (next <= 0) {
        const index = deck.zones[zone].indexOf(entry)
        deck.zones[zone].splice(index, 1)
      } else {
        entry.count = next
      }
      deck.updatedAt = Date.now()
    },
    entryCountSet(
      state,
      action: PayloadAction<{ deckId: string; zone: DeckZone; entryId: string; count: number }>,
    ) {
      const { deckId, zone, entryId, count } = action.payload
      const deck = state.lists.find((d) => d.id === deckId)
      if (!deck) return
      const entry = deck.zones[zone].find((candidate) => candidate.id === entryId)
      if (!entry) return
      if (count <= 0) {
        const index = deck.zones[zone].indexOf(entry)
        deck.zones[zone].splice(index, 1)
      } else {
        entry.count = count
      }
      deck.updatedAt = Date.now()
    },
    entryCommanderToggled(state, action: PayloadAction<{ deckId: string; entryId: string }>) {
      const { deckId, entryId } = action.payload
      const deck = state.lists.find((d) => d.id === deckId)
      if (!deck) return
      const entry = deck.zones.main.find((candidate) => candidate.id === entryId)
      if (!entry) return

      if (entry.commander) {
        entry.commander = false
      } else {
        const already = deck.zones.main.filter((candidate) => candidate.commander)
        if (already.length >= 2) {
          // Keep the two-commander limit: promote replaces the oldest commander.
          already[0]!.commander = false
        }
        entry.commander = true
      }
      deck.updatedAt = Date.now()
    },
  },
})

export const {
  deckCreated,
  deckRenamed,
  deckDeleted,
  entryAdded,
  entryRemoved,
  entryCountChanged,
  entryCountSet,
  entryCommanderToggled,
} = decksSlice.actions

export default decksSlice.reducer