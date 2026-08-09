import { Icon } from '../../components/ui/Icon'

export function LifeCounterPage() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-edge py-20 text-center">
      <Icon name="heart" className="h-10 w-10 text-faint" />
      <h1 className="font-display text-2xl text-text">Life Counter</h1>
      <p className="text-sm text-muted">Track life, commander damage, and poison. Coming soon.</p>
    </section>
  )
}