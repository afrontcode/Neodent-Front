import type { ReactNode } from 'react'

/** Fila de filtros sobre una tabla. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">{children}</div>
}
