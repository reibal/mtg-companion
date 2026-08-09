import type * as Tesseract from 'tesseract.js'

export interface ScanResult {
  text: string
  proposedName: string | null
}

let workerPromise: Promise<Tesseract.Worker> | null = null

async function getWorker(): Promise<Tesseract.Worker> {
  workerPromise ??= import('tesseract.js').then((mod) =>
    mod.createWorker('eng', mod.OEM.LSTM_ONLY, { logger: () => undefined }),
  )
  return workerPromise
}

const SKIP_LEADERS = new Set([
  'legendary',
  'creature',
  'sorcery',
  'instant',
  'enchantment',
  'artifact',
  'land',
  'artifact',
  'battle',
  'planeswalker',
  'basic',
  'tribal',
  'kindred',
  'you',
  'when',
  'at',
  'begin',
  'draw',
  'target',
  'put',
  'each',
  'if',
  'untap',
  'tap',
  'this',
  'that',
])

export function pickCardName(text: string): string | null {
  const lines = text
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean)

  for (const line of lines) {
    const firstWord = line.split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '') ?? ''
    if (line.length < 2 || line.length > 48) continue
    if (!firstWord) continue
    if (/^[0-9]/.test(firstWord) || firstWord === 'x' || firstWord.length === 1) continue
    if (SKIP_LEADERS.has(firstWord)) continue
    if (line.includes('{') || line.includes('//')) continue
    if (line.includes(':') && line.length > 20) continue
    if (line.startsWith('ws') || line.startsWith('ww')) continue
    return line
  }
  return null
}

function stripNulls(value: string): string {
  return value.split('\u0000').join('').trim()
}

export async function scanCardText(blob: Blob): Promise<ScanResult> {
  const worker = await getWorker()
  const { data } = await worker.recognize(blob, { rotateAuto: true })
  const text = stripNulls(data.text ?? '')
  return { text, proposedName: pickCardName(text) }
}