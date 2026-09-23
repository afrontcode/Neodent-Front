import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

/** Enlace de vuelta a la pantalla anterior. */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="mb-2 inline-block print:hidden text-[0.95rem] font-bold text-ink-soft hover:text-brand"
    >
      &lt; {children}
    </Link>
  )
}
