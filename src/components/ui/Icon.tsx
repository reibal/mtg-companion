import type { ReactNode } from 'react'

const ICON_PATHS: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M9.5 20v-5h5v5" />
    </>
  ),
  cards: (
    <>
      <path d="m12 3 8 4.5-8 4.5-8-4.5Z" />
      <path d="M4 12.5l8 4.5 8-4.5" />
      <path d="M4 16.5 12 21l8-4.5" />
    </>
  ),
  heart: <path d="M19.4 12.8 12 20l-7.4-7.2a4.7 4.7 0 0 1 .7-6.8A4.7 4.7 0 0 1 12 8.2a4.7 4.7 0 0 1 6.7-2.2 4.7 4.7 0 0 1 .7 6.8Z" />,
  crown: <path d="M4 8l4 3.5L12 6l4 5.5L20 8l-1.5 9.5h-13Z" />,
  scan: (
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v2" />
      <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
      <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4.5 4.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M6.3 6.3l11.4 11.4" />
      <path d="M17.7 6.3 6.3 17.7" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  x: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  edit: (
    <>
      <path d="M17 3l4 4L8 20H3v-5Z" />
      <path d="m14 6 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </>
  ),
}

export type IconName = keyof typeof ICON_PATHS

type IconProps = { name: IconName; className?: string }

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name]}
    </svg>
  )
}