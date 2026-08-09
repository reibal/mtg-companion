import { NavLink, Outlet } from 'react-router-dom'
import { Icon, type IconName } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'

type NavItem = { to: string; label: string; icon: IconName; end?: boolean }

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/cards', label: 'Cards', icon: 'cards' },
  { to: '/decks', label: 'Decks', icon: 'crown' },
  { to: '/life', label: 'Life', icon: 'heart' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  const base = 'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors'
  return isActive ? `${base} bg-ink-800 text-gold` : `${base} text-muted hover:bg-ink-800 hover:text-text`
}

export function AppShell() {
  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="sticky top-0 z-20 border-b border-edge bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2.5 text-text" aria-label="MTG Companion home">
            <Logo className="h-9 w-9" />
            <span className="font-display text-xl tracking-wide">MTG Companion</span>
          </NavLink>
          <nav aria-label="Primary" className="ml-auto flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-faint">
        Card data and images provided by Scryfall, &#169; Wizards of the Coast.
      </footer>
    </div>
  )
}