import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '@/components/ui/Icon'

type Props = {
  value: string
  onValueChange: (value: string) => void
  suggestions: string[]
  onSubmit: (term: string) => void
  placeholder?: string
}

export function CardSearchInput({ value, onValueChange, suggestions, onSubmit, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const closeTimer = useRef<number | undefined>(undefined)

  useEffect(() => setActive(0), [suggestions])

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.min(current + 1, Math.max(suggestions.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      const term = open && suggestions[active] ? suggestions[active] : value
      onSubmit(term)
      setOpen(false)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const focusOpen = () => {
    window.clearTimeout(closeTimer.current)
    if (value.trim() !== '') setOpen(true)
  }

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  return (
    <div className="relative">
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={focusOpen}
        onBlur={scheduleClose}
        placeholder={placeholder ?? 'Search a Magic card…'}
        aria-label="Search cards"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className="w-full rounded-md border border-edge bg-ink-800 py-2.5 pl-9 pr-3 text-text placeholder:text-faint focus:border-gold/60"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-edge bg-ink-800 shadow-xl">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSubmit(suggestion)
                  setOpen(false)
                }}
                onMouseEnter={() => setActive(index)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  index === active ? 'bg-ink-700 text-text' : 'text-muted'
                }`}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}