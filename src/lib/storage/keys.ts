const PREFIX = 'mtg'

/** Versioned keys so stored payloads can be migrated between schema versions. */
export const storageKeys = {
  decks: `${PREFIX}.decks.v1`,
  game: `${PREFIX}.game.v1`,
  settings: `${PREFIX}.settings.v1`,
} as const