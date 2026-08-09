import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAppDispatch } from '@/app/hooks'
import { useLazyNamedCardQuery } from '@/lib/scryfall/api'
import type { ScryfallCard } from '@/lib/types/card'
import type { DeckZone } from '@/lib/types/deck'
import { DECK_ZONE_LABELS, DECK_ZONES } from '@/lib/types/deck'
import { useCamera } from '@/hooks/useCamera'
import { entryAdded } from '../decksSlice'
import { toDeckCard } from '../model'
import { cropToNameStrip, isOcrReady, preloadOcr, scanCardText } from './ocr'

type Props = {
  deckId: string
  onClose: () => void
}

type Phase = 'idle' | 'live' | 'scanning' | 'resolving' | 'matched' | 'failed'

export function ScannerModal({ deckId, onClose }: Props) {
  const dispatch = useAppDispatch()
  const camera = useCamera()
  const [zone, setZone] = useState<DeckZone>('main')
  const [phase, setPhase] = useState<Phase>('idle')
  const [matchedCard, setMatchedCard] = useState<ScryfallCard | null>(null)
  const [ocrText, setOcrText] = useState<string>('')
  const [triedNames, setTriedNames] = useState<string[]>([])
  const [frameUrl, setFrameUrl] = useState<string | null>(null)
  const [cropUrl, setCropUrl] = useState<string | null>(null)

  const [resolve] = useLazyNamedCardQuery()

  useEffect(() => {
    if (!isOcrReady()) preloadOcr().catch(() => undefined)
  }, [])

  async function handleStartCamera() {
    const ok = await camera.start()
    if (ok) setPhase('live')
  }

  async function handleCapture() {
    const blob = await camera.capture()
    if (!blob) {
      setPhase('failed')
      return
    }
    setPhase('scanning')
    setMatchedCard(null)
    setOcrText('')
    setTriedNames([])
    if (frameUrl) URL.revokeObjectURL(frameUrl)
    setFrameUrl(null)
    if (cropUrl) URL.revokeObjectURL(cropUrl)
    setCropUrl(null)
    if (!isOcrReady()) {
      await preloadOcr().catch(() => undefined)
    }

    let cropped = blob
    setFrameUrl(URL.createObjectURL(blob))
    try {
      cropped = await cropToNameStrip(blob)
      setCropUrl(URL.createObjectURL(cropped))
    } catch {
      // fall back to the full frame if cropping fails
    }

    const { text, names } = await scanCardText(cropped)
    setOcrText(text)
    if (names.length === 0) {
      setPhase('failed')
      return
    }

    for (const name of names) {
      setPhase('resolving')
      try {
        const result = await resolve(name)
        if (result.data) {
          setMatchedCard(result.data)
          setPhase('matched')
          return
        }
        setTriedNames((prev) => [...prev, name])
      } catch {
        setTriedNames((prev) => [...prev, name])
      }
    }
    setPhase('failed')
  }

  function handleAdd() {
    if (!matchedCard) return
    dispatch(entryAdded({ deckId, zone, card: toDeckCard(matchedCard) }))
    reset()
  }

  function reset() {
    setPhase(camera.running ? 'live' : 'idle')
    setMatchedCard(null)
    setOcrText('')
    setTriedNames([])
    if (frameUrl) URL.revokeObjectURL(frameUrl)
    setFrameUrl(null)
    if (cropUrl) URL.revokeObjectURL(cropUrl)
    setCropUrl(null)
  }

  const showCapture = camera.running && (phase === 'live' || phase === 'failed')

  return (
    <Modal title="Scan a card" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Add to:</span>
          {DECK_ZONES.map((candidate: DeckZone) => (
            <button
              key={candidate}
              type="button"
              onClick={() => setZone(candidate)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                zone === candidate
                  ? 'bg-gold text-ink-950'
                  : 'border border-edge bg-ink-700 text-muted hover:text-text'
              }`}
            >
              {DECK_ZONE_LABELS[candidate]}
            </button>
          ))}
        </div>

        <div className="relative mx-auto aspect-3/4 h-[55dvh] max-w-full overflow-hidden rounded-lg border border-edge bg-ink-950 sm:h-[65dvh]">
          <video
            ref={camera.videoRef}
            playsInline
            muted
            className={`absolute inset-0 h-full w-full object-cover ${
              phase === 'scanning' || phase === 'resolving' ? 'opacity-40' : ''
            }`}
          />
          {!camera.running && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center">
              <p className="max-w-xs text-sm text-muted">
                Point your camera at a card's name and scan — the app will find the card on Scryfall.
              </p>
              <Button onClick={handleStartCamera}>
                <span>Start camera</span>
              </Button>
            </div>
          )}
          {showCapture && (
            <div className="absolute inset-x-0 bottom-[6%] z-20 flex justify-center">
              <button
                type="button"
                aria-label="Capture card"
                onClick={handleCapture}
                className="block h-16 w-16 rounded-full bg-ink-950/60 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
              >
                <span className="mx-auto block h-12 w-12 rounded-full border-[3px] border-gold bg-gold/90 shadow-inner" />
              </button>
            </div>
          )}
          {camera.running && (phase === 'live' || phase === 'failed') && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="relative h-[94%]">
                <div className="mx-auto aspect-5/7 h-full rounded-lg border-2 border-dashed border-gold/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
                <div className="absolute left-1/2 top-[5%] flex -translate-x-1/2 items-center gap-1.5 rounded border border-gold/60 bg-ink-950/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
                  Name
                </div>
              </div>
            </div>
          )}
        </div>

        {camera.error && (
          <p className="rounded-md border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{camera.error}</p>
        )}

        {(phase === 'scanning' || phase === 'resolving') && (
          <p className="text-center text-sm text-muted">
            {phase === 'scanning' ? 'Reading card name… this can take a few seconds.' : 'Confirming on Scryfall…'}
          </p>
        )}

        {phase === 'failed' && (
          <div className="space-y-2 rounded-md border border-edge bg-ink-700 px-4 py-3 text-sm">
            <p className="text-faint">Couldn't identify that card. Try again with the card name filling the frame.</p>
            <details className="open:pb-1">
              <summary className="cursor-pointer text-xs text-muted">Debug: detected text</summary>
              <div className="mt-2 space-y-1">
                {frameUrl && (
                  <>
                    <p className="pt-1 text-xs text-faint">Captured frame:</p>
                    <img src={frameUrl} alt="Captured frame" className="w-full rounded border border-edge" />
                  </>
                )}
                {cropUrl && (
                  <>
                    <p className="pt-1 text-xs text-faint">Region sent to OCR:</p>
                    <img src={cropUrl} alt="Cropped name region" className="w-full rounded border border-edge" />
                  </>
                )}
                <p className="pt-1 text-xs text-faint">Queried Scryfall:</p>
                {triedNames.length > 0 ? (
                  <ul className="list-inside list-disc text-xs text-muted">
                    {triedNames.map((name, index) => (
                      <li key={`${name}-${index}`}>&ldquo;{name}&rdquo;</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted">No candidates produced.</p>
                )}
                <p className="pt-1 text-xs text-faint">Raw OCR text:</p>
                <pre className="whitespace-pre-wrap wrap-break-word rounded bg-ink-950/60 p-2 text-xs text-muted">
                  {ocrText || '(empty)'}
                </pre>
              </div>
            </details>
          </div>
        )}

        {phase === 'matched' && matchedCard && (
          <div className="rounded-md border border-edge bg-ink-700 p-3">
            <p className="text-xs text-faint">Identified:</p>
            <p className="font-display text-lg text-text">{matchedCard.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={handleAdd}>Add to {DECK_ZONE_LABELS[zone].toLowerCase()}</Button>
              <Button variant="secondary" onClick={reset}>
                Scan another
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}