import { configureStore } from '@reduxjs/toolkit'
import { scryfallApi } from '@/lib/scryfall/api'
import decksReducer from '@/features/decks/decksSlice'
import { localStoragePort, saveJSON, storageKeys } from '@/lib/storage'

export const store = configureStore({
  reducer: {
    [scryfallApi.reducerPath]: scryfallApi.reducer,
    decks: decksReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(scryfallApi.middleware),
})

// Best-effort persistence: fire on every dispatch, cheap for a small slice.
store.subscribe(() => {
  const { decks } = store.getState()
  saveJSON(localStoragePort, storageKeys.decks, decks.lists)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch