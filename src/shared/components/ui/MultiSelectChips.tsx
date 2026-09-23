import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Icon } from './Icon'

export interface ChipOption {
  value: string
  label: string
}

interface Props {
  options: readonly ChipOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function MultiSelectChips({ options, value, onChange, placeholder = 'Selecciona una o varias opciones', disabled = false }: Props) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter(item => item !== option) : [...value, option])
  }

  return (
    <div ref={container} className="relative">
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-control border border-line bg-surface px-3 py-2">
        {value.map(item => (
          <span key={item} className="inline-flex items-center gap-1 rounded-lg bg-brand-soft px-2 py-1 text-sm font-semibold text-brand">
            {options.find(option => option.value === item)?.label ?? item}
            <button type="button" disabled={disabled} aria-label={`Quitar ${item}`}
              onClick={() => toggle(item)} className="cursor-pointer px-1">×</button>
          </span>
        ))}
        <button type="button" disabled={disabled} aria-expanded={open}
          onClick={() => setOpen(current => !current)}
          className="min-w-24 flex-1 cursor-pointer py-1 text-left text-sm text-muted">
          {value.length ? 'Agregar otro…' : placeholder}
        </button>
        <button type="button" disabled={disabled} aria-label={open ? 'Cerrar opciones' : 'Mostrar opciones'}
          onClick={() => setOpen(current => !current)} className="cursor-pointer text-ink-soft transition-colors hover:text-ink">
          <Icon name="chevronDown" size={18} className={cn('transition-transform duration-200', open && 'rotate-180')} />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-control border border-line bg-surface p-1 shadow-lg">
          {options.map(option => (
            <button key={option.value} type="button" onClick={() => toggle(option.value)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-soft">
              <span>{option.label}</span>
              {value.includes(option.value) && <span className="font-bold text-brand">✓</span>}
            </button>
          ))}
          {!options.length && <p className="px-3 py-2 text-sm text-muted">No hay opciones disponibles.</p>}
        </div>
      )}
    </div>
  )
}