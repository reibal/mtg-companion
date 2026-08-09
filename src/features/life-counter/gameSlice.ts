import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { GameMode, GameState, Player } from '@/lib/types/game'
import { MAX_PLAYERS, MIN_PLAYERS, STARTING_LIFE } from '@/lib/types/game'
import { makeId } from '@/lib/ids'
import { loadJSON } from '@/lib/storage'
import { localStoragePort, storageKeys } from '@/lib/storage'

const EMPTY: GameState = { mode: 'standard', players: [] }

/** Hydrate a saved game at module load (best-effort). */
const persisted = loadJSON<GameState>(localStoragePort, storageKeys.game)

const initialState: GameState =
  persisted && persisted.players && persisted.players.length > 0 ? persisted : { ...EMPTY }

function makePlayer(mode: GameMode): Player {
  return {
    id: makeId(),
    name: 'Player',
    life: STARTING_LIFE[mode],
  }
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    gameStarted(state, action: PayloadAction<{ mode: GameMode; count: number }>) {
      const count = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, action.payload.count))
      state.mode = action.payload.mode
      state.players = Array.from({ length: count }, (_, index) => ({
        ...makePlayer(action.payload.mode),
        name: `Player ${index + 1}`,
      }))
    },
    gameEnded(state) {
      state.players = []
    },
    playerNameChanged(state, action: PayloadAction<{ id: string; name: string }>) {
      const player = state.players.find((p) => p.id === action.payload.id)
      if (player) player.name = action.payload.name.trim() || player.name
    },
    lifeChanged(state, action: PayloadAction<{ id: string; delta: number }>) {
      const player = state.players.find((p) => p.id === action.payload.id)
      if (!player) return
      player.life = Math.max(0, player.life + action.payload.delta)
    },
  },
})

export const {
  gameStarted,
  gameEnded,
  playerNameChanged,
  lifeChanged,
} = gameSlice.actions

export default gameSlice.reducer