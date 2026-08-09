export type CardColor = 'W' | 'U' | 'B' | 'R' | 'G'

export const MANA_COLORS: Record<CardColor, string> = {
  W: '#f2efe5',
  U: '#63a4e8',
  B: '#2b2b33',
  R: '#de5a53',
  G: '#5bbd7b',
}

export interface CardImageUris {
  small: string
  normal: string
  large: string
  png: string
  artCrop: string
}

export interface CardFace {
  name: string
  manaCost?: string
  typeLine: string
  oracleText?: string
  flavorText?: string
  power?: string
  toughness?: string
  imageUris?: CardImageUris
}

/**
 * A Scryfall card, narrowed to the fields the app consumes.
 * Multi-faced cards carry per-face data in `cardFaces`; `imageUris`
 * and `oracleText` are then on the faces, not here.
 */
export interface ScryfallCard {
  id: string
  name: string
  layout?: string
  rarity?: string
  manaCost?: string
  cmc?: number
  colors?: CardColor[]
  colorIdentity?: CardColor[]
  typeLine?: string
  oracleText?: string
  flavorText?: string
  power?: string
  toughness?: string
  set?: string
  setName?: string
  collectorNumber?: string
  imageUris?: CardImageUris
  cardFaces?: CardFace[]
  prices?: Record<string, string | null>
  rulingsUri?: string
  scryfallUri?: string
}