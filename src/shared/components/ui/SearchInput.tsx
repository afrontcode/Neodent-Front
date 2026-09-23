import type { InputHTMLAttributes } from 'react'
import { Icon } from './Icon'

/** Campo de búsqueda con lupa. Crece para ocupar el espacio libre del toolbar. */
export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative min-w-56 flex-1">
      <Icon
        name="search"
        size={18}
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        className="w-full rounded-control border border-line bg-surface py-3 pr-4 pl-11 text-[0.95rem] placeholder:text-muted focus:border-brand focus:outline-none"
        {...props}
      />
    </div>
  )
}
