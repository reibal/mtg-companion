/**
 * Minimal synchronous KV store.
 * The app depends on this interface (not on localStorage directly),
 * so the persistence backend can be swapped later (IndexedDB, server…).
 */
export interface StoragePort {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}