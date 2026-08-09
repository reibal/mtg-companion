import { useEffect, type ReactNode } from 'react'
import { Icon } from './Icon'

type ModalProps = { title?: string; onClose: () => void; children: ReactNode }

export function Modal({ title, onClose, children }: ModalProps) {
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
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Dialog'}
        className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-lg border border-edge bg-ink-800 shadow-2xl"
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