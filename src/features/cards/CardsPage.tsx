import { Icon } from '../../components/ui/Icon'

export function CardsPage() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-edge py-20 text-center">
      <Icon name="cards" className="h-10 w-10 text-faint" />
      <h1 className="font-display text-2xl text-text">Cards Database</h1>
      <p className="text-sm text-muted">Search and browse every Magic card. Coming soon.</p>
    </section>
  )
}