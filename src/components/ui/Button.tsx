import type { ButtonHTMLAttributes, Ref } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from './Icon'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  outline: 'bg-surface text-brand border border-brand hover:bg-brand-soft',
  ghost: 'bg-surface text-ink-soft border border-line hover:bg-hover',
  danger: 'bg-danger text-white hover:brightness-95',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: IconName
  ref?: Ref<HTMLButtonElement>
}

export function Button({ variant = 'primary', icon, className, children, ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-control px-5 py-3 text-[0.92rem] font-bold transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} size={18} strokeWidth={2.2} />}
      {children}
    </button>
  )
}
