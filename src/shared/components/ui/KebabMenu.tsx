import { useRef, useState, useCallback } from 'react'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from './Icon'
import { IconButton } from './IconButton'

export interface MenuAction {
  label: string
  icon: IconName
  onClick: () => void
  danger?: boolean
  /** Dibuja una línea separadora encima del ítem. */
  dividerBefore?: boolean
  /** Si es false el ítem no se renderiza (para acciones condicionales). */
  show?: boolean
}

/** Botón "⋮" con menú desplegable. Se cierra al hacer clic fuera o al elegir una acción. */
export function KebabMenu({ actions }: { actions: MenuAction[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  const visible = actions.filter((a) => a.show !== false)

  return (
    <div className="relative inline-block" ref={ref}>
      <IconButton
        icon="kebab"
        aria-label="Acciones"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div
          role="menu"
          className="absolute top-10 right-0 z-30 min-w-[15rem] rounded-xl border border-line bg-surface p-1.5 text-left shadow-menu"
        >
          {visible.map((a) => (
            <div key={a.label}>
              {a.dividerBefore && <hr className="mx-1 my-1.5 border-t border-line" />}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  a.onClick()
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[0.88rem] hover:bg-alt',
                  a.danger ? 'text-danger [&_svg]:text-danger' : 'text-ink [&_svg]:text-muted',
                )}
              >
                <Icon name={a.icon} size={17} />
                {a.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
