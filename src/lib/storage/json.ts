import type { StoragePort } from './port'

export function loadJSON<T>(storage: StoragePort, key: string): T | null {
  const raw = storage.get(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function saveJSON<T>(storage: StoragePort, key: string, value: T): void {
  storage.set(key, JSON.stringify(value))
}