import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useResolveCardsMutation } from '@/lib/scryfall/api'
import { DECK_FORMATS, type DeckFormat } from '@/lib/types/deck'
import type { DeckZone } from '@/lib/types/deck'
import { entriesMerged, deckCreated, type ImportAddition } from '../decksSlice'
import { toDeckCard } from '../model'
import { parseMoxfieldText } from '../import/parser'

type Phase = 'input' | 'resolving' | 'done'
type Target = { mode: 'new'; name: string; format?: DeckFormat } | { mode: 'existing'; deckId: string }

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

type Props = { onClose: () => void }

export function ImportDeckDialog({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const decks = useAppSelector((state) => state.decks.lists)
  const [resolveCards] = useResolveCardsMutation()

  const [raw, setRaw] = useState('')
  const [target, setTarget] = useState<Target>(() => ({ mode: 'new', name: '' }))
  const [phase, setPhase] = useState<Phase>('input')
  const [report, setReport] = useState<{ addedCards: number; missing: string[] }>({
    addedCards: 0,
    missing: [],
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const parsed = useMemo(() => parseMoxfieldText(raw), [raw])
  const totalCards = parsed.totalCards

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  async function handleImport() {
    const names = [...new Set(parsed.lines.map((entry) => entry.name))]
    if (names.length === 0) return
    setPhase('resolving')

    const result = await resolveCards(names)
    if (result.error) {
      setReport({ addedCards: 0, missing: names })
      setPhase('done')
      return
    }

    const { cards, missing } = result.data
    const byName = new Map<string, ImportAction>()
    for (const card of cards) {
      byName.set(card.name.toLowerCase(), { ...card, id: card.id })
      for (const face of card.cardFaces ?? []) {
        const faceKey = face.name.toLowerCase()
        if (!byName.has(faceKey)) byName.set(faceKey, { ...card, id: card.id })
      }
    }

    const additionsByZone: Record<DeckZone, ImportAddition[]> = {
      main: [],
      side: [],
      consider: [],
    }
    for (const entry of parsed.lines) {
      const match = byName.get(entry.name.toLowerCase())
      if (!match) continue
      additionsByZone[entry.zone].push({ card: toDeckCard(match), count: entry.count })
    }

    if (target.mode === 'new') {
      const deckId = makeId()
      dispatch(deckCreated({ id: deckId, name: target.name.trim() || 'Imported deck', format: target.format }))
      dispatch(entriesMerged({ deckId, zones: additionsByZone }))
    } else {
      dispatch(entriesMerged({ deckId: target.deckId, zones: additionsByZone }))
    }

    const addedCards = Object.values(additionsByZone).reduce(
      (sum, additions) => sum + additions.reduce((s, addition) => s + addition.count, 0),
      0,
    )
    const failed = [
      ...new Set(
        parsed.lines
          .filter((entry) => !byName.get(entry.name.toLowerCase()))
          .map((entry) => entry.name),
      ),
    ]
    setReport({ addedCards, missing: [...new Set([...missing, ...failed])] })
    setPhase('done')
  }

  function reset() {
    setRaw('')
    setTarget({ mode: 'new', name: '' })
    setReport({ addedCards: 0, missing: [] })
    setPhase('input')
  }

  return (
    <Modal title="Import from Moxfield" onClose={onClose}>
      {phase !== 'done' ? (
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-muted">Paste a plain text decklist</span>
            <textarea
              ref={textareaRef}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              rows={10}
              spellCheck={false}
              placeholder={"1 Brigid, Clachan's Heart // Brigid, Doun's Mind\n6 Forest\n\n1 Sol Ring"}
              className="w-full rounded-md border border-edge bg-ink-700 px-3 py-2 font-mono text-sm text-text placeholder:text-faint focus:border-gold/60"
            />
          </label>

          {totalCards > 0 && (
            <div className="rounded-md border border-edge bg-ink-700 px-4 py-3 text-sm text-muted">
              <span className="font-semibold text-text">{totalCards}</span> cards parsed
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm text-muted">Import into</div>
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="radio"
                checked={target.mode === 'new'}
                onChange={() => setTarget({ mode: 'new', name: '' })}
              />
              New deck
            </label>
            {target.mode === 'new' && (
              <div className="ml-6 flex flex-wrap gap-2">
                <input
                  value={target.name}
                  onChange={(event) => setTarget({ ...target, name: event.target.value })}
                  placeholder="Deck name"
                  className="w-56 rounded-md border border-edge bg-ink-700 px-3 py-2 text-sm text-text placeholder:text-faint focus:border-gold/60"
                />
                <select
                  value={target.format ?? ''}
                  onChange={(event) =>
                    setTarget({ ...target, format: event.target.value === '' ? undefined : (event.target.value as DeckFormat) })
                  }
                  className="rounded-md border border-edge bg-ink-700 px-3 py-2 text-sm text-text focus:border-gold/60"
                >
                  <option value="">No format</option>
                  {DECK_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {format.charAt(0).toUpperCase() + format.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="radio"
                checked={target.mode === 'existing'}
                onChange={() =>
                  setTarget({ mode: 'existing', deckId: decks[0]?.id ?? '' })
                }
              />
              Merge into existing deck
            </label>
            {target.mode === 'existing' && (
              <div className="ml-6">
                <select
                  value={target.deckId}
                  onChange={(event) => setTarget({ mode: 'existing', deckId: event.target.value })}
                  className="w-full rounded-md border border-edge bg-ink-700 px-3 py-2 text-sm text-text focus:border-gold/60"
                >
                  {decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={totalCards === 0 || phase === 'resolving'}
              onClick={handleImport}
            >
              {phase === 'resolving' ? 'Resolving…' : `Import ${totalCards} cards`}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text">
            Added {report.addedCards} of {parsed.totalCards} cards.
          </p>
          {report.missing.length > 0 && (
            <div className="rounded-md border border-bad/40 bg-bad/10 px-4 py-3 text-sm">
              <p className="font-medium text-bad">Couldn't add these cards:</p>
              <ul className="mt-1 list-inside list-disc text-muted">
                {report.missing.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={reset}>
              Import another
            </Button>
            <Button type="button" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

type ImportAction = ReturnType<typeof toDeckCard> & { id: string }