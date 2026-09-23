import type { ReactNode } from 'react'

/** Fila de filtros sobre una tabla. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 p-4">{children}</div>
}
