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
    poison: 0,
    commanderDamage: {},
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
    playerNameChanged(state, action: PayloadAction<{ id: string; name: string }>) {
      const player = state.players.find((p) => p.id === action.payload.id)
      if (player) player.name = action.payload.name.trim() || player.name
    },
    playerAdded(state) {
      if (state.players.length >= MAX_PLAYERS) return
      const player = makePlayer(state.mode)
      player.name = `Player ${state.players.length + 1}`
      state.players.push(player)
    },
    playerRemoved(state, action: PayloadAction<string>) {
      if (state.players.length <= MIN_PLAYERS) return
      const index = state.players.findIndex((p) => p.id === action.payload)
      if (index !== -1) {
        state.players.splice(index, 1)
        // Clean up dangling commander-damage references to the removed player.
        for (const p of state.players) {
          delete p.commanderDamage[action.payload]
        }
      }
    },
    lifeChanged(state, action: PayloadAction<{ id: string; delta: number }>) {
      const player = state.players.find((p) => p.id === action.payload.id)
      if (!player) return
      player.life = Math.max(0, player.life + action.payload.delta)
    },
    lifeSet(state, action: PayloadAction<{ id: string; value: number }>) {
      const player = state.players.find((p) => p.id === action.payload.id)
      if (!player) return
      player.life = Math.max(0, action.payload.value)
    },
    poisonChanged(state, action: PayloadAction<{ id: string; delta: number }>) {
      const player = state.players.find((p) => p.id === action.payload.id)
      if (!player) return
      player.poison = Math.max(0, player.poison + action.payload.delta)
    },
    commanderDamageChanged(state, action: PayloadAction<{ fromId: string; toId: string; delta: number }>) {
      const { fromId, toId, delta } = action.payload
      const victim = state.players.find((p) => p.id === toId)
      if (!victim) return
      victim.commanderDamage[fromId] = Math.max(0, (victim.commanderDamage[fromId] ?? 0) + delta)
    },
  },
})

export const {
  gameStarted,
  playerNameChanged,
  playerAdded,
  playerRemoved,
  lifeChanged,
  lifeSet,
  poisonChanged,
  commanderDamageChanged,
} = gameSlice.actions

export default gameSlice.reducer