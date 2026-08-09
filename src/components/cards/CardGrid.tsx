import type { ScryfallCard } from '@/lib/types/card'
import { CardImage } from './CardImage'

type Props = {
  cards: ScryfallCard[]
  onSelect: (card: ScryfallCard) => void
}

export function CardGrid({ cards, onSelect }: Props) {
  return (
    <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {cards.map((card) => (
        <li key={card.id}>
          <button
            type="button"
            onClick={() => onSelect(card)}
            className="group w-full text-left"
            aria-label={`View ${card.name}`}
          >
            <CardImage
              card={card}
              size="normal"
              className="aspect-[63/88] w-full rounded-md border border-edge object-cover transition group-hover:border-gold/70"
            />
            <p className="mt-1.5 truncate text-xs text-muted group-hover:text-text" title={card.name}>
              {card.name}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}