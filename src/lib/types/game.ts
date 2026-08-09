export type GameMode = 'standard' | 'commander'

export const STARTING_LIFE: Record<GameMode, number> = {
  standard: 20,
  commander: 40,
}

export interface Player {
  id: string
  name: string
  life: number
}

export interface GameState {
  mode: GameMode
  players: Player[]
}

export const MAX_PLAYERS = 4
export const MIN_PLAYERS = 2