import type { StoragePort } from './port'

export function createLocalStoragePort(): StoragePort {
  return {
    get(key) {
      try {
        return window.localStorage.getItem(key)
      } catch {
        return null
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value)
      } catch {
        // Persistence is best-effort (private mode, quota…); never throw in the UI.
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key)
      } catch {
        // Ignore; removal is best-effort too.
      }
    },
  }
}

export const localStoragePort = createLocalStoragePort()