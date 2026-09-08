import { cn } from '@/lib/cn'
import { Icon } from './Icon'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const cell =
  'grid size-9 place-items-center rounded-lg border border-line bg-surface text-[0.88rem] font-bold transition'

/** Navegación por páginas. No se renderiza si sólo hay una. */
export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Paginación" className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={cn(cell, 'cursor-pointer text-ink-soft hover:bg-alt disabled:cursor-default disabled:opacity-40 disabled:hover:bg-surface')}
      >
        <Icon name="chevronLeft" size={16} strokeWidth={2.2} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-label={`Página ${p}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
          className={cn(
            cell,
            'cursor-pointer',
            p === page ? 'border-brand bg-brand text-white' : 'text-ink-soft hover:bg-alt',
          )}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        aria-label="Página siguiente"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(cell, 'cursor-pointer text-ink-soft hover:bg-alt disabled:cursor-default disabled:opacity-40 disabled:hover:bg-surface')}
      >
        <Icon name="chevronRight" size={16} strokeWidth={2.2} />
      </button>
    </nav>
  )
}
