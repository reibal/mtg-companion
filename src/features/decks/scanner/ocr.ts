import type * as Tesseract from 'tesseract.js'

export interface ScanResult {
  text: string
  names: string[]
}

let warm = false

async function createWorker(): Promise<Tesseract.Worker> {
  const mod = await import('tesseract.js')
  const worker = await mod.createWorker('eng', mod.OEM.LSTM_ONLY, { logger: () => undefined })
  await worker.setParameters({ preserve_interword_spaces: '1' })
  return worker
}

/** Warm the tesseract chunk + model cache so the first scan spins up fast. */
export async function preloadOcr(): Promise<void> {
  try {
    const worker = await createWorker()
    await worker.terminate()
    warm = true
  } catch {
    warm = false
  }
}

export function isOcrReady(): boolean {
  return warm
}

const ASPECT = 3 / 4

function coverCrop(videoW: number, videoH: number) {
  const boxRatio = ASPECT
  const sourceRatio = videoW / videoH
  if (sourceRatio <= boxRatio) {
    const regionH = videoW / boxRatio
    return { x: 0, y: (videoH - regionH) / 2, w: videoW, h: regionH }
  }
  const regionW = videoH * boxRatio
  return { x: (videoW - regionW) / 2, y: 0, w: regionW, h: videoH }
}

const STRIP_Y = 0.04
const STRIP_H = 0.22
const STRIP_X = 0.04
const STRIP_W = 0.70
const MIN_STRIP_HEIGHT = 600

/** Reproduce the on-screen 3:4 cover crop, then zoom into the name strip. */
export async function cropToNameStrip(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)
  const { x: ox, y: oy, w: ow, h: oh } = coverCrop(bitmap.width, bitmap.height)
  const sx = ox + ow * STRIP_X
  const sy = oy + oh * STRIP_Y
  const sw = ow * STRIP_W
  const sh = oh * STRIP_H

  const scale = Math.max(1, MIN_STRIP_HEIGHT / sh)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw * scale)
  canvas.height = Math.round(sh * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas unavailable')
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.filter = 'grayscale(1) contrast(1.2) brightness(1.05)'
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((out) => (out ? resolve(out) : reject(new Error('toBlob failed'))), 'image/png'),
  )
}

function normalizeWord(word: string): string {
  return word.replace(/[^A-Za-z'’\-. ]/g, '').trim()
}

function stripNulls(value: string): string {
  return value.split('\u0000').join('').trim()
}

interface LineCandidate {
  text: string
  confidence: number
  /** Vertical position of the line within the image (0 = top). */
  y: number
}

const MAX_CANDIDATES = 3

async function recognizeLines(
  worker: Tesseract.Worker,
  blob: Blob,
  mode: Tesseract.PSM,
): Promise<{ text: string; candidates: LineCandidate[] }> {
  await worker.setParameters({ tessedit_pageseg_mode: mode })
  const { data } = await worker.recognize(blob, { rotateAuto: true }, { blocks: true })

  const candidates: LineCandidate[] = []
  for (const block of data.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const cleaned = normalizeWord(line.text).replace(/\s+/g, ' ').trim()
        if (cleaned.length < 2 || cleaned.length > 48) continue
        candidates.push({
          text: cleaned,
          confidence: line.confidence,
          y: line.bbox.y0 ?? 0,
        })
      }
    }
  }

  return { text: stripNulls(data.text ?? ''), candidates }
}

export async function scanCardText(blob: Blob): Promise<ScanResult> {
  const worker = await createWorker()
  try {
    const { PSM } = await import('tesseract.js')

    let allText = ''
    const ranked: LineCandidate[] = []

    const modes: Tesseract.PSM[] = [PSM.SINGLE_LINE, PSM.SINGLE_BLOCK]
    for (const mode of modes) {
      const { text, candidates } = await recognizeLines(worker, blob, mode)
      allText = allText || text
      ranked.push(...candidates)
      if (ranked.length >= MAX_CANDIDATES * 2) break
    }

    const seen = new Set<string>()
    const names: string[] = []
    // The card name is the topmost line in the strip; sort y first, then confidence.
    ranked
      .sort((a, b) => a.y - b.y || b.confidence - a.confidence)
      .forEach((candidate) => {
        const firstWord = candidate.text.split(' ')[0]?.toLowerCase() ?? ''
        if (/^[0-9]/.test(firstWord) || firstWord.length === 1) return
        if (candidate.text.includes('{') || candidate.text.includes('//')) return
        const key = candidate.text.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        names.push(candidate.text)
      })

    return { text: allText, names: names.slice(0, MAX_CANDIDATES) }
  } finally {
    await worker.terminate()
  }
}