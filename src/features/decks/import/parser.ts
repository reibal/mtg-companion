import type { DeckZone } from '@/lib/types/deck'

export interface ParsedImportLine {
  name: string
  count: number
  zone: DeckZone
}

export interface ParsedImport {
  lines: ParsedImportLine[]
  totalCards: number
}

const ZONE_HEADERS: Record<string, DeckZone> = {
  mainboard: 'main',
  main: 'main',
  'main deck': 'main',
  sideboard: 'side',
  side: 'side',
  maybeboard: 'consider',
  'maybe board': 'consider',
  maybe: 'consider',
  considering: 'consider',
  consider: 'consider',
}

/**
 * Parse a plaintext decklist: one line per card, `N Card Name`, with optional
 * Moxfield zone headers (`// Sideboard`, `// Maybeboard`, …).
 *
 *   - `1 Brigid, Clachan's Heart // Brigid, Doun's Mind`
 *   - `6 Forest`
 *   - `1x Sol Ring` / `1 Sol Ring (LEA) 221`
 *
 * Cards before any header go to the mainboard. Empty lines and unrecognized
 * `//` comments are ignored. Duplicate names within a zone are merged by
 * summing their quantities.
 */
export function parseMoxfieldText(raw: string): ParsedImport {
  const lines: ParsedImportLine[] = []
  let zone: DeckZone = 'main'

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/\s+/g, ' ')
    if (!line) continue

    if (line.startsWith('//')) {
      const headerZone = ZONE_HEADERS[line.replace(/^\/\/*\s*/, '').toLowerCase()]
      if (headerZone) zone = headerZone
      continue
    }

    const countMatch = line.match(/^(\d+)[xX]?\s+(.+)$/)
    if (!countMatch) continue

    const count = parseInt(countMatch[1]!, 10)
    const name = stripSetup(cleanName(countMatch[2]!))
    if (!name) continue

    const existing = lines.find((entry) => entry.name === name && entry.zone === zone)
    if (existing) {
      existing.count += count
    } else {
      lines.push({ name, count, zone })
    }
  }

  const totalCards = lines.reduce((sum, entry) => sum + entry.count, 0)
  return { lines, totalCards }
}

function stripSetup(name: string): string {
  // Unify curly apostrophes, common on pasted exports.
  return name.replace(/’/g, "'")
}

function cleanName(name: string): string {
  // Strip a trailing `(SET) number`, `(SET)`, or `(number)` — set printing info.
  const cleaned = name.replace(/\s*\([^)]*\)\s*(?:\d+\s*)?$/u, '').trim()
  return cleaned || name
}