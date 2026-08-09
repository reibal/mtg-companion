import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../../components/ui/Icon'

type Tool = { title: string; blurb: string; icon: IconName; href: string }

const TOOLS: Tool[] = [
  {
    title: 'Cards Database',
    blurb: 'Search any card and read its full rules text.',
    icon: 'cards',
    href: '/cards',
  },
  {
    title: 'Deck Manager',
    blurb: 'Build decks, mark commanders, track your wishlist.',
    icon: 'crown',
    href: '/decks',
  },
  {
    title: 'Life Counter',
    blurb: 'Normal and Commander games with commander damage.',
    icon: 'heart',
    href: '/life',
  },
]

export function HomePage() {
  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h1 className="font-display text-3xl tracking-wide">
          Your companion for the <span className="text-gold">game table</span>.
        </h1>
        <p className="max-w-xl text-muted">
          Look up cards, tinker with decks, scan your collection, and track the game.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className="group rounded-lg border border-edge bg-ink-800 p-6 transition-colors hover:border-gold/60 hover:bg-ink-700"
          >
            <Icon name={tool.icon} className="mb-4 h-7 w-7 text-gold" />
            <h2 className="font-display text-lg text-text">{tool.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{tool.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}