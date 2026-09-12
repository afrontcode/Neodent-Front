import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from './Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Icono decorativo a la izquierda. */
  icon?: IconName
  /** Control adicional a la derecha (por ejemplo, mostrar/ocultar contraseña). */
  trailing?: ReactNode
}

export function Input({ icon, trailing, className, ...props }: InputProps) {
  const control = (
    <input
      className={cn(
        'w-full rounded-control border border-line bg-surface px-4 py-3 text-[0.95rem] text-ink',
        'placeholder:text-muted focus:border-brand focus:outline-none',
        'aria-invalid:border-danger',
        icon ? 'pl-12' : undefined,
        trailing ? 'pr-12' : undefined,
        className,
      )}
      {...props}
    />
  )

  if (!icon && !trailing) return control

  return (
    <div className="relative">
      {icon && (
        <Icon
          name={icon}
          size={20}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-soft"
        />
      )}
      {control}
      {trailing && <div className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</div>}
    </div>
  )
}
