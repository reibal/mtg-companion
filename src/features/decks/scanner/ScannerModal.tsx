import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAppDispatch } from '@/app/hooks'
import { useLazyNamedCardQuery } from '@/lib/scryfall/api'
import type { DeckZone } from '@/lib/types/deck'
import { DECK_ZONE_LABELS, DECK_ZONES } from '@/lib/types/deck'
import { useCamera } from '@/hooks/useCamera'
import { entryAdded } from '../decksSlice'
import { toDeckCard } from '../model'
import { scanCardText } from './ocr'

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

  const [resolve, {
    data: card,
    isFetching: resolving,
    isError,
    reset: resetResolution,
  }] = useLazyNamedCardQuery()

  useEffect(() => () => camera.stop(), [camera])

  async function handleCapture() {
    const blob = await camera.capture()
    if (!blob) return
    setPhase('scanning')
    resetResolution()
    const result = await scanCardText(blob)
    if (result.proposedName) {
      setPhase('resolving')
      resolve(result.proposedName)
    } else {
      setPhase('live')
    }
  }

  useEffect(() => {
    if (phase !== 'resolving' || resolving) return
    if (isError || !card) setPhase('failed')
    else setPhase('matched')
  }, [phase, resolving, isError, card])

  function handleAdd() {
    if (!card) return
    dispatch(entryAdded({ deckId, zone, card: toDeckCard(card) }))
    reset()
  }

  function reset() {
    setPhase(camera.running ? 'live' : 'idle')
    resetResolution()
  }

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

        <div className="relative overflow-hidden rounded-lg border border-edge bg-ink-950">
          {!camera.running ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 text-center">
              <p className="max-w-xs text-sm text-muted">
                Point your camera at a card's name and scan — the app will find the card on Scryfall.
              </p>
              <Button onClick={camera.start}>
                <span>Start camera</span>
              </Button>
            </div>
          ) : (
            <video
              ref={camera.videoRef}
              playsInline
              muted
              className={`aspect-[4/3] w-full object-cover ${phase === 'scanning' || phase === 'resolving' ? 'opacity-40' : ''}`}
            />
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
          <p className="rounded-md border border-edge bg-ink-700 px-4 py-3 text-sm text-faint">
            Couldn't identify that card. Try again with the card name filling more of the frame.
          </p>
        )}

        {phase === 'matched' && card && (
          <div className="rounded-md border border-edge bg-ink-700 p-3">
            <p className="text-xs text-faint">Identified:</p>
            <p className="font-display text-lg text-text">{card.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={handleAdd}>Add to {DECK_ZONE_LABELS[zone].toLowerCase()}</Button>
              <Button variant="secondary" onClick={reset}>
                Scan another
              </Button>
            </div>
          </div>
        )}

        {camera.running && (phase === 'live' || phase === 'failed') && (
          <div className="flex gap-2">
            <Button onClick={handleCapture}>Capture</Button>
          </div>
        )}
      </div>
    </Modal>
  )
}