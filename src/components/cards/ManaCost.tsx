import type { CardColor } from '@/lib/types/card'

const MANA_COLORS: Record<CardColor, string> = {
  W: '#f2efe5',
  U: '#63a4e8',
  B: '#2b2b33',
  R: '#de5a53',
  G: '#5bbd7b',
}

/** Renders a single braced mana-cost token, e.g. "R", "2", "T", "W/U". */
export function ManaGlyph({ symbol, small = false }: { symbol: string; small?: boolean }) {
  const size = small ? 'size-4 text-[9px]' : 'size-5 text-[10px]'
  const color = MANA_COLORS[symbol as CardColor]

  if (color) {
    const darkText = symbol === 'W'
    return (
      <span
        className={`inline-flex ${size} items-center justify-center rounded-full font-bold ${darkText ? 'text-[#171c2b]' : 'text-[#eef1f7]'}`}
        style={{ backgroundColor: color }}
        title={`{${symbol}}`}
      >
        {symbol}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex ${size} items-center justify-center rounded-full border border-edge bg-ink-700 font-semibold text-text`}
      title={`{${symbol}}`}
    >
      {symbol}
    </span>
  )
}

/** Renders a mana-cost string like "{2}{W}{U}" as a row of glyphs. */
export function ManaCost({ cost }: { cost?: string }) {
  const tokens = /(\{[^}]+\})/g
  const parts = cost?.split(tokens) ?? []
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {parts
        .filter((part) => part.startsWith('{'))
        .map((part, index) => (
          <ManaGlyph key={part + index} symbol={part.slice(1, -1)} />
        ))}
    </span>
  )
}

/** Renders free-form text (oracle/flavor) with embedded {mana} symbols. */
export function SymbolText({ text, className }: { text?: string; className?: string }) {
  if (!text) return null
  const parts = text.split(/(\{[^}]+\})/g)
  return (
    <p className={`text-sm leading-relaxed text-text ${className ?? ''}`}>
      {parts.map((part, index) =>
        part.startsWith('{') ? <ManaGlyph key={index} symbol={part.slice(1, -1)} small /> : part,
      )}
    </p>
  )
}