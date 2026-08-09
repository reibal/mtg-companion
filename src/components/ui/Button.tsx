import type { ComponentPropsWithoutRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gold text-ink-950 hover:bg-gold-bright',
  secondary: 'border border-edge bg-ink-800 text-text hover:bg-ink-700',
  ghost: 'text-muted hover:bg-ink-800 hover:text-text',
  danger: 'bg-bad/15 text-bad hover:bg-bad/25',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant }

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`} {...rest} />
}