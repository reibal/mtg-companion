import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

type ModalProps = { title?: string; onClose: () => void; children: ReactNode }

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Move focus into the dialog on open, restore it on close, and trap Tab.
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    const onTabDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const focusables = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((element) => !element.hasAttribute('disabled'))
      if (focusables.length === 0) return
      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onTabDown)
    return () => {
      window.removeEventListener('keydown', onTabDown)
      previousFocusRef.current?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Dialog'}
        tabIndex={-1}
        className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-lg border border-edge bg-ink-800 shadow-2xl outline-none"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-edge bg-ink-800 px-5 py-3">
          <h2 className="font-display text-lg text-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-muted hover:bg-ink-700 hover:text-text"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}