import type { CardColor } from '../types/card'

/** Raw Scryfall wire shapes (snake_case). Kept internal to the data layer. */

export interface RawImageUris {
  small: string
  normal: string
  large: string
  png: string
  art_crop: string
}

export interface RawCardFace {
  name: string
  mana_cost?: string
  type_line: string
  oracle_text?: string
  flavor_text?: string
  power?: string
  toughness?: string
  image_uris?: RawImageUris
}

export interface RawCard {
  id: string
  name: string
  layout?: string
  rarity?: string
  mana_cost?: string
  cmc?: number
  colors?: CardColor[]
  color_identity?: CardColor[]
  type_line?: string
  oracle_text?: string
  flavor_text?: string
  power?: string
  toughness?: string
  set?: string
  set_name?: string
  collector_number?: string
  image_uris?: RawImageUris
  card_faces?: RawCardFace[]
  prices?: Record<string, string | null>
  rulings_uri?: string
  scryfall_uri?: string
}

export interface RawCardSearchResponse {
  data: RawCard[]
  has_more: boolean
  total_cards?: number
  next_page?: string
}