# MTG Companion — Build Plan

A clean, maintainable companion app for Magic: The Gathering — **Cards Database**, **Deck Manager (with Card Scanner)**, and a full **Life Counter** — built on the existing Vite + React + TypeScript scaffold.

## Stack

- **Build:** Vite 8 + React 19 + TypeScript (strict), already scaffolded.
- **Styling:** Tailwind 4 (CSS-first `@theme` tokens), wired first. Dark theme **"Arcane Ink & Gold"**.
- **Routing:** `react-router` (`createBrowserRouter`), URL-per-page.
- **State:** Redux Toolkit (slices + `createEntityAdapter`) + **RTK Query** for all Scryfall data (shared cache, de-dup, abort-on-unmount).
- **Persistence:** localStorage via a `StoragePort` interface + adapter (swap for a real DB later). Middleware serializes store slices.
- **Scanner:** `getUserMedia` camera → lazily-loaded `tesseract.js` OCR → Scryfall `/cards/named?fuzzy` → user-confirmed add.

## Decisions (agreed)

- Scanner = Camera + OCR + confirm (best-effort ~80–90%, confirm prevents wrong adds).
- Life Counter = normal (2p, 20) and full Commander (2–4p, 40, per-pair commander damage, poison).
- Deck Manager = full: name/format, quantities, ≤2 commanders, zones (main/sideboard/consider), stats.
- Platform = React + Vite (scratch the RN idea); camera requires an `https` origin (fine in dev on localhost).
- Rate limits = not a concern (small user base): no throttle/429 machinery; RTK Query defaults + `keepUnusedDataFor` long persistence make lookups instant.
- Assets = favicon/logo/nav icons generated to fit the palette.

## Design system — "Arcane Ink & Gold"

```
ink-950  #0B0E17   page background   ink-900   #10131F   elevated surface
ink-800  #171C2B   surface           ink-700   #212838   raised card / row
edge     #2E3750   borders
gold        #E7B84E   primary accent   gold-bright  #F5DEA0   hover
arcane      #9D7CFF   secondary accent (commanders)
glow        #7FA6E8   info / active
text        #EDF0F7   primary text      muted #A7B0C4   faint #667090
good        #59C489   success / +life   bad   #E2706F   damage
```

Mana chips: W `#F2EFE5` · U `#63A4E8` · B `#2B2B33` · R `#DE5A53` · G `#5BBD7B` · gold `#D6A64A`.

- Fonts: **Cinzel** (Google Fonts, arcane display serif) for headings; system-ui sans body.
- Subtle radial vignette tints (arcane violet + glow blue) over `ink-950`; `sm` radius, always-focus-visible.
- Cards render full-frame (Scryfall image policy: no crop/watermark/distort), artist credit visible.

## Architecture (SOLID)

```
src/
  app/            store.ts, router.tsx, providers (main.tsx), AppShell layout
  components/
    ui/           Button, Badge, Modal, Spinner, Input, EmptyState, Icon…
    cards/        CardSearchInput, CardGrid, CardDetail, CardFace   (shared, "dumb")
  features/
    cards/        CardsPage + search hooks (Cards Database)
    decks/        DeckList, DeckDetail, slice/selectors, scanner/
    life-counter/ slice, helpers, LifeCounterPage + player components
  lib/
    types/        card.ts (narrow Scryfall shapes), deck.ts, game.ts
    storage/      StoragePort (interface) + LocalStorageAdapter
    scryfall/     endpoint builders + typed responses (consumed via RTK Query)
  theme/          index.css (@theme tokens) + design.css
```

- `lib` is React-free and pure → unit-testable (Vitest, optional).
- `components/cards` shared by the Cards DB **and** the Deck Manager dialog (SRP/ISP, no duplication).
- `StoragePort` interface keeps the DB swap post-scaffold trivial (Open/Closed).
- Reducers/selectors are pure functions.

## Feature spec

- **Cards DB** `@/`cards`: typeahead (autocomplete) → art grid → detail modal (cost, type, oracle text, set, rarity, prices, legalities, related/rulings). Cached through RTK Query.
- **Decks** `/decks`, `/decks/:deckId` — normalized entries per zone, quantity steppers, ≤2 commanders enforced in slice, stats (total, mana curve, color identity breakdown).
- **Scanner** (inside a deck) — camera → frame → OCR name → fuzzy match → show candidate art → confirm → add to chosen zone. Graceful no-camera / no-match states.
- **Life Counter** `/life` — start (normal 20 / Commander 40, 2–4 players), ± controls, per-pair commander damage matrix, poison, rename/add/remove, reset.
- **Home** `/` — shortcut tiles to the three tools.

## Build order (gate: `pnpm lint && pnpm build` + manual dev check each phase)

1. Foundations — Tailwind 4 + tokens + fonts, store, router + shell + nav, brand assets, README update.
2. Data layer — `lib/scryfall` endpoints, `StoragePort`/adapter, Rx-TK wiring, typed shapes.
3. Cards Database.
4. Deck Manager (incl. shared card components).
5. Life Counter.
6. Scanner (camera + OCR + confirm flow).
7. Polish — empty states, error boundaries, a11y pass, remove Vite-boilerplate leftovers.

## Quality bar

- `oxlint` + `tsc -b` clean; strict TS (`verbatimModuleSyntax`, no enums).
- Pure logic tested with optional Vitest.
- Camera dev runs on `localhost`/`https`.
- README kept accurate along the way.

## Non-goals

- No auth/server; localStorage only until production DB.
- No offline/PWA (possible later).
- No legality enforcement, no arena integration.