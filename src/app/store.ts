import { configureStore } from '@reduxjs/toolkit'
import { scryfallApi } from '@/lib/scryfall/api'
import decksReducer from '@/features/decks/decksSlice'
import gameReducer from '@/features/life-counter/gameSlice'
import { localStoragePort, saveJSON, storageKeys } from '@/lib/storage'

export const store = configureStore({
  reducer: {
    [scryfallApi.reducerPath]: scryfallApi.reducer,
    decks: decksReducer,
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(scryfallApi.middleware),
})

// Best-effort persistence: fire on every dispatch, cheap for small slices.
store.subscribe(() => {
  const { decks, game } = store.getState()
  saveJSON(localStoragePort, storageKeys.decks, decks.lists)
  saveJSON(localStoragePort, storageKeys.game, game)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch