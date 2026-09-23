import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[]
  /** Primera opción vacía, para filtros o valores sin definir. */
  placeholder?: string
}

export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full cursor-pointer appearance-none rounded-control border border-line bg-surface py-3 pr-10 pl-4 text-[0.95rem] text-ink',
          'focus:border-brand focus:outline-none',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon
        name="chevronDown"
        size={18}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-soft"
      />
    </div>
  )
}
