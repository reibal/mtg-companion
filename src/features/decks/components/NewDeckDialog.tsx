import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DECK_FORMATS, type DeckFormat } from '@/lib/types/deck'

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (name: string, format?: DeckFormat) => void
}

export function NewDeckDialog({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [format, setFormat] = useState<DeckFormat | ''>('')

  useEffect(() => {
    if (open) {
      setName('')
      setFormat('')
    }
  }, [open])

  if (!open) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed, format === '' ? undefined : format)
  }

  return (
    <Modal title="New deck" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Deck name</span>
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Esper Control"
            className="w-full rounded-md border border-edge bg-ink-700 px-3 py-2 text-text placeholder:text-faint focus:border-gold/60"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Format</span>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as DeckFormat | '')}
            className="w-full rounded-md border border-edge bg-ink-700 px-3 py-2 text-text focus:border-gold/60"
          >
            <option value="">No format</option>
            {DECK_FORMATS.map((entry) => (
              <option key={entry} value={entry}>
                {entry.charAt(0).toUpperCase() + entry.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={name.trim() === ''}>
            Create deck
          </Button>
        </div>
      </form>
    </Modal>
  )
}