import type { Deck } from '@/lib/types/deck'
import { DECK_ZONE_LABELS, DECK_ZONES } from '@/lib/types/deck'

/** Moxfield-style plaintext decklist: one line per card, `//` comment section headers. */
export function serializeDeckText(deck: Deck): string {
  const lines: string[] = [deck.name]

  for (const zone of DECK_ZONES) {
    const entries = deck.zones[zone]
    if (entries.length === 0) continue
    lines.push('', `// ${DECK_ZONE_LABELS[zone]}`)
    for (const entry of entries) lines.push(`${entry.count} ${entry.name}`)
  }

  return `${lines.join('\n')}\n`
}

export function downloadFile(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}