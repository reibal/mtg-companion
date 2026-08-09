import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="font-display text-3xl text-text">Lost in the Blind Eternities</h1>
      <p className="text-sm text-muted">This page does not exist.</p>
      <Link to="/" className="text-gold hover:text-gold-bright">
        Back home
      </Link>
    </section>
  )
}