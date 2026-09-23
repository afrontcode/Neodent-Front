import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Texto de la etiqueta; admite contenido enriquecido (por ejemplo, un enlace). */
  label: ReactNode
}

/** Casilla con etiqueta. La casilla nativa queda oculta y se pinta encima con los tokens de marca. */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-start gap-2.5 text-[0.9rem] text-ink-soft', className)}>
      <span className="relative mt-px grid size-5 flex-none place-items-center">
        <input
          type="checkbox"
          className={cn(
            'peer size-5 cursor-pointer appearance-none rounded-[5px] border border-line bg-surface transition',
            'checked:border-brand checked:bg-brand',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1',
          )}
          {...props}
        />
        <Icon
          name="check"
          size={13}
          strokeWidth={3}
          className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label}
    </label>
  )
}
