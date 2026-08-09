type LogoProps = { className?: string }

export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect x="6" y="6" width="52" height="52" rx="13" fill="#171C2B" stroke="#E7B84E" strokeWidth="3" />
      <path d="M32 13l5.3 13.7L51 32l-13.7 5.3L32 51l-5.3-13.7L13 32l13.7-5.3Z" fill="#E7B84E" />
      <circle cx="32" cy="32" r="6" fill="#171C2B" />
      <circle cx="32" cy="32" r="3" fill="#9D7CFF" />
    </svg>
  )
}