import type { CardImageUris, ScryfallCard } from '@/lib/types/card'

type ImageSize = keyof CardImageUris
export type CardImageSize = 'small' | 'normal' | 'large' | 'png'

type Props = {
  card: ScryfallCard
  size: CardImageSize
  className?: string
  alt?: string
}

function pickImage(card: ScryfallCard, size: ImageSize): string | undefined {
  return card.imageUris?.[size] ?? card.cardFaces?.find((face) => face.imageUris?.[size])?.imageUris?.[size]
}

export function CardImage({ card, size, className, alt }: Props) {
  const src = pickImage(card, size)
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-ink-700 text-center text-xs text-faint ${className ?? ''}`}>
        {card.name}
      </div>
    )
  }
  return <img src={src} alt={alt ?? card.name} loading="lazy" draggable={false} className={className} />
}