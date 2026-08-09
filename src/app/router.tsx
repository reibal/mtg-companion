import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { HomePage } from '../features/home/HomePage'
import { CardsPage } from '../features/cards/CardsPage'
import { DeckListPage } from '../features/decks/DeckListPage'
import { DeckDetailPage } from '../features/decks/DeckDetailPage'
import { LifeCounterPage } from '../features/life-counter/LifeCounterPage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cards', element: <CardsPage /> },
      { path: 'decks', element: <DeckListPage /> },
      { path: 'decks/:deckId', element: <DeckDetailPage /> },
      { path: 'life', element: <LifeCounterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])