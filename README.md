# MTG Companion
A companion app to help with the deckbuilding, wishlisting, and gameplay.

## Features
The features included in this app are (or will be):
- **Life Counter** (TBI):
  - A life counter for MTG games (normal and Commander)
- **Cards Database** (TBI):
  - A database (using ScryFall's API) where you can check any cards, and all their effects.
- **Deck Manager** (TBI):
  - You can create a deck (empty at first) and add cards to it. You can mark up to 2 of them as Commanders.
- **Card Scanner** (TBI):
  - A tool in the Deck Manager to use your camera to scan your cards and add them to a deck.

## Technical notes
- This app is built around Vite+React.
- For styles, it uses Tailwind 4 (CSS-first `@theme` tokens, dark "Arcane Ink & Gold" palette).
- Navigation uses react-router.
- State management uses Redux Toolkit (slices) with RTK Query for Scryfall data.
- Once this is intended for production, it will use a Database. Until then, it will use localStorage.
- For MTG info (cards, etc), the API to consume will be ScryFall (https://scryfall.com/docs/api).

### Future posibilities/considerations
- The camera scanner uses client-side OCR (Tesseract.js); results are always confirmed manually.