import { NavLink, Outlet } from 'react-router-dom'
import { Icon, type IconName } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'

type NavItem = { to: string; label: string; icon: IconName; end?: boolean }

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/cards', label: 'Cards', icon: 'card' },
  { to: '/decks', label: 'Decks', icon: 'cards' },
  { to: '/life', label: 'Life', icon: 'heart' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  const base =
    'flex items-center justify-center gap-2 rounded-md p-2.5 text-sm font-medium transition-colors sm:px-3 sm:py-2'
  return isActive ? `${base} bg-ink-800 text-gold` : `${base} text-muted hover:bg-ink-800 hover:text-text`
}

export function AppShell() {
  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="sticky top-0 z-20 border-b border-edge bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] sm:gap-6 sm:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5 text-text" aria-label="MTG Companion home">
            <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
            <span className="hidden font-display text-xl tracking-wide sm:inline">MTG Companion</span>
          </NavLink>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label} className={navLinkClass}>
                <Icon name={item.icon} className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 pt-2 text-xs text-faint sm:px-6">
        <p className="pb-[max(env(safe-area-inset-bottom),2rem)]">
          Card data and images provided by Scryfall, &#169; Wizards of the Coast.
        </p>
      </footer>
    </div>
  )
}