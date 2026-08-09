import type { ScryfallCard, CardFace, CardImageUris } from '../types/card'
import type { RawCard, RawImageUris, RawCardFace } from './raw'

function normalizeImageUris(raw?: RawImageUris): CardImageUris | undefined {
  if (!raw) return undefined
  return {
    small: raw.small,
    normal: raw.normal,
    large: raw.large,
    png: raw.png,
    artCrop: raw.art_crop,
  }
}

function normalizeFace(raw: RawCardFace): CardFace {
  return {
    name: raw.name,
    manaCost: raw.mana_cost,
    typeLine: raw.type_line,
    oracleText: raw.oracle_text,
    flavorText: raw.flavor_text,
    power: raw.power,
    toughness: raw.toughness,
    imageUris: normalizeImageUris(raw.image_uris),
  }
}

/** Maps a raw Scryfall card into the app's domain shape. */
export function normalizeCard(raw: RawCard): ScryfallCard {
  return {
    id: raw.id,
    name: raw.name,
    layout: raw.layout,
    rarity: raw.rarity,
    manaCost: raw.mana_cost,
    cmc: raw.cmc,
    colors: raw.colors,
    colorIdentity: raw.color_identity,
    typeLine: raw.type_line,
    oracleText: raw.oracle_text,
    flavorText: raw.flavor_text,
    power: raw.power,
    toughness: raw.toughness,
    set: raw.set,
    setName: raw.set_name,
    collectorNumber: raw.collector_number,
    imageUris: normalizeImageUris(raw.image_uris),
    cardFaces: raw.card_faces?.map(normalizeFace),
    prices: raw.prices,
    rulingsUri: raw.rulings_uri,
    scryfallUri: raw.scryfall_uri,
  }
}