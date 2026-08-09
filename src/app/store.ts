import { configureStore } from '@reduxjs/toolkit'
import { scryfallApi } from '../lib/scryfall/api'

export const store = configureStore({
  reducer: {
    [scryfallApi.reducerPath]: scryfallApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(scryfallApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch