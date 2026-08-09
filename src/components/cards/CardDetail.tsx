import type { CardFace, ScryfallCard } from '@/lib/types/card'
import { CardImage } from './CardImage'
import { ManaCost, SymbolText } from './ManaCost'
import { Icon } from '@/components/ui/Icon'

type Props = { card: ScryfallCard }

function RarityLabel({ rarity }: { rarity?: string }) {
  if (!rarity) return null
  return (
    <span className="rounded-full border border-edge bg-ink-700 px-2.5 py-0.5 text-xs uppercase tracking-wide text-muted">
      {rarity}
    </span>
  )
}

function FaceBlock({ face }: { face: CardFace }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg text-text">{face.name}</h3>
        <ManaCost cost={face.manaCost} />
      </div>
      {face.typeLine && <p className="text-xs italic text-muted">{face.typeLine}</p>}
      {face.oracleText && <SymbolText text={face.oracleText} />}
      {face.flavorText && <SymbolText text={face.flavorText} className="italic text-faint" />}
      {(face.power || face.toughness) && (
        <p className="text-sm font-semibold text-text">
          {face.power}/{face.toughness}
        </p>
      )}
    </div>
  )
}

export function CardDetail({ card }: Props) {
  const faces = card.cardFaces && card.cardFaces.length > 0 ? card.cardFaces : null
  const price = card.prices

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,300px)_1fr]">
      <div className="space-y-4">
        {faces ? (
          faces.map((face) => (
            <CardImage
              key={face.name}
              card={{ ...card, imageUris: face.imageUris }}
              size="large"
              className="w-full rounded-md border border-edge"
            />
          ))
        ) : (
          <CardImage card={card} size="large" className="w-full rounded-md border border-edge" />
        )}
        {price && (price.usd || price.eur) && (
          <p className="text-sm text-faint">
            {price.usd ? `$${price.usd} (USD)` : ''}
            {price.usd && price.eur ? ' · ' : ''}
            {price.eur ? `€${price.eur} (EUR)` : ''}
          </p>
        )}
      </div>

      <div className="space-y-5">
        {!faces && (
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl text-text">{card.name}</h3>
            <ManaCost cost={card.manaCost} />
          </div>
        )}
        {!faces && card.typeLine && <p className="text-xs italic text-muted">{card.typeLine}</p>}
        {!faces && card.oracleText && <SymbolText text={card.oracleText} />}
        {!faces && card.flavorText && <SymbolText text={card.flavorText} className="italic text-faint" />}
        {!faces && card.power && card.toughness && (
          <p className="text-sm font-semibold text-text">
            {card.power}/{card.toughness}
          </p>
        )}

        {faces && (
          <div className="space-y-6">
            {faces.map((face) => (
              <FaceBlock key={face.name} face={face} />
            ))}
          </div>
        )}

        <footer className="space-y-2 border-t border-edge pt-4 text-sm text-muted">
          <div className="flex flex-wrap items-center gap-2">
            <RarityLabel rarity={card.rarity} />
            <span>
              {card.setName} (#{card.collectorNumber})
            </span>
          </div>
          {card.cmc !== undefined && <div>Mana value: {card.cmc}</div>}
          {card.scryfallUri && (
            <a
              href={card.scryfallUri}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-gold hover:text-gold-bright"
            >
              View on Scryfall <Icon name="chevron-right" className="h-3.5 w-3.5" />
            </a>
          )}
        </footer>
      </div>
    </div>
  )
}