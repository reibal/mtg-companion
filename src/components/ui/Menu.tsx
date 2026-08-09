import { useEffect, type ReactNode } from 'react'

type MenuProps = {
  onClose: () => void
  align?: 'left' | 'right'
  children: ReactNode
}

export function Menu({ onClose, align = 'left', children }: MenuProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="menu"
        className={`absolute z-50 min-w-44 overflow-hidden rounded-lg border border-edge bg-ink-700 py-1 shadow-2xl ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        {children}
      </div>
    </>
  )
}

type MenuButtonProps = {
  onClick: () => void
  danger?: boolean
  children: ReactNode
}

export function MenuButton({ onClick, danger = false, children }: MenuButtonProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`block w-full whitespace-nowrap px-3 py-1.5 text-left text-sm transition-colors ${
        danger ? 'text-bad hover:bg-bad/10' : 'text-text hover:bg-ink-600'
      }`}
    >
      {children}
    </button>
  )
}