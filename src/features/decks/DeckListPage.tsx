import { Icon } from '../../components/ui/Icon'

export function DeckListPage() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-edge py-20 text-center">
      <Icon name="crown" className="h-10 w-10 text-faint" />
      <h1 className="font-display text-2xl text-text">Deck Manager</h1>
      <p className="text-sm text-muted">Your decks will appear here. Coming soon.</p>
    </section>
  )
}