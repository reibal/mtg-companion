import { useRef, useState, type PointerEvent } from 'react'
import type { Player } from '@/lib/types/game'

type Props = {
  player: Player
  onNameChange: (name: string) => void
  onLifeDelta: (delta: number) => void
}

type Half = 'plus' | 'minus'

const LONG_PRESS_MS = 500
const MOVE_CANCEL_THRESHOLD = 12

function lifeTone(life: number) {
  if (life <= 5) return 'text-bad'
  if (life <= 10) return 'text-gold'
  return 'text-text'
}

export function PlayerPanel({ player, onNameChange, onLifeDelta }: Props) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(player.name)
  const [held, setHeld] = useState<Half | null>(null)
  const pressActive = useRef(false)
  const longHit = useRef(false)
  const pressTimer = useRef<number | null>(null)
  const pressOrigin = useRef<{ x: number; y: number } | null>(null)

  function clearTimer() {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function cancelPress() {
    clearTimer()
    pressActive.current = false
    longHit.current = false
    setHeld(null)
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>, half: Half) {
    event.currentTarget.setPointerCapture(event.pointerId)
    pressActive.current = true
    pressOrigin.current = { x: event.clientX, y: event.clientY }
    longHit.current = false
    setHeld(half)
    clearTimer()
    pressTimer.current = window.setTimeout(() => {
      longHit.current = true
      pressTimer.current = null
      onLifeDelta(half === 'plus' ? 10 : -10)
    }, LONG_PRESS_MS)
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!pressActive.current || !pressOrigin.current) return
    const dx = event.clientX - pressOrigin.current.x
    const dy = event.clientY - pressOrigin.current.y
    // A scroll (or any drag) that travels this far is not a tap.
    if (Math.hypot(dx, dy) > MOVE_CANCEL_THRESHOLD) cancelPress()
  }

  function handlePointerUp(half: Half) {
    if (!pressActive.current) return
    clearTimer()
    setHeld(null)
    if (!longHit.current) onLifeDelta(half === 'plus' ? 1 : -1)
    pressActive.current = false
    longHit.current = false
  }

  const commitName = () => {
    onNameChange(nameDraft)
    setEditingName(false)
  }

  const dead = player.life <= 0

  return (
    <article
      className={`flex min-h-[10rem] select-none flex-col overflow-hidden rounded-2xl border shadow-xl sm:min-h-[14rem] ${
        dead
          ? 'border-bad/50 bg-gradient-to-b from-bad/30 to-ink-950'
          : 'border-edge bg-gradient-to-b from-ink-800 to-ink-900'
      }`}
    >
      <header className="flex items-center justify-between gap-2 border-b border-edge/70 bg-ink-950/40 px-4 py-2.5">
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitName()
              if (event.key === 'Escape') setEditingName(false)
            }}
            aria-label="Player name"
            className="min-w-0 flex-1 rounded-md border border-edge bg-ink-700 px-2 py-1 text-sm text-text focus:border-gold/60"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(player.name)
              setEditingName(true)
            }}
            title="Rename player"
            className="max-w-full truncate text-sm font-medium text-text hover:text-gold"
          >
            {player.name}
          </button>
        )}
      </header>

      {/* Tap zones: left half −, right half +. Hold for ±10. */}
      <div className="relative flex flex-1 items-stretch">
        <button
          type="button"
          aria-label={`Decrease ${player.name}'s life`}
          onPointerDown={(event) => handlePointerDown(event, 'minus')}
          onPointerMove={handlePointerMove}
          onPointerUp={() => handlePointerUp('minus')}
          onPointerCancel={cancelPress}
          onContextMenu={(event) => event.preventDefault()}
          className={`flex-1 touch-manipulation transition-colors duration-100 ${
            held === 'minus' ? 'bg-bad/20' : 'hover:bg-bad/5'
          }`}
        />

        <div aria-hidden="true" className="w-px shrink-0 bg-edge/60" />

        <button
          type="button"
          aria-label={`Increase ${player.name}'s life`}
          onPointerDown={(event) => handlePointerDown(event, 'plus')}
          onPointerMove={handlePointerMove}
          onPointerUp={() => handlePointerUp('plus')}
          onPointerCancel={cancelPress}
          onContextMenu={(event) => event.preventDefault()}
          className={`flex-1 touch-manipulation transition-colors duration-100 ${
            held === 'plus' ? 'bg-good/20' : 'hover:bg-good/5'
          }`}
        />

        {/* Decorative layers (pointer-events-none so taps pass through). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-stretch justify-between p-4 sm:p-6"
        >
          <span
            className={`flex items-center text-4xl font-extralight transition-colors sm:text-5xl ${
              held === 'minus' ? 'text-bad' : 'text-bad/40'
            }`}
          >
            −
          </span>
          <span
            className={`flex items-center text-4xl font-extralight transition-colors sm:text-5xl ${
              held === 'plus' ? 'text-good' : 'text-good/40'
            }`}
          >
            +
          </span>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div aria-hidden="true" className="absolute h-28 w-28 rounded-full bg-arcane/10 blur-2xl" />
          <span
            key={player.life}
            aria-live="polite"
            className={`relative animate-[life-pop_160ms_ease-out] font-display text-6xl leading-none tabular-nums ${lifeTone(
              player.life,
            )} sm:text-7xl`}
          >
            {player.life}
          </span>
          <span className="relative text-[10px] uppercase tracking-widest text-faint">
            tap ±1 · hold ±10
          </span>
        </div>
      </div>
    </article>
  )
}