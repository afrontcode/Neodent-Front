import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Stepper } from '@/shared/components/ui'
import { BOOKING_STEPS } from '../../model/catalog'

interface BookingLayoutProps {
  /** Paso en curso, empezando en 0. */
  step: number
  children: ReactNode
  /** Acciones de la barra inferior, alineadas a la derecha. */
  footer: ReactNode
}

/**
 * Marco de las pantallas de reserva: cabecera con salida, progreso por pasos y
 * una barra de acciones anclada abajo.
 *
 * Los márgenes negativos anulan el relleno del área de contenido (p-7 en
 * AppShell) para que la barra llegue a los bordes, y el alto recupera esos
 * 3.5rem (1.75 arriba + 1.75 abajo) para que no quede scroll sobrante.
 */
export function BookingLayout({ step, children, footer }: BookingLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="-m-7 flex h-[calc(100%+3.5rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-7 pt-7">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[1.9rem] leading-tight font-bold tracking-tight">Programar una cita</h1>
          <Button variant="ghost" icon="logout" onClick={() => navigate('/mis-citas')}>
            Salir
          </Button>
        </header>

        <Stepper steps={BOOKING_STEPS} current={step} />

        {children}
      </div>

      <footer className="flex flex-none items-center justify-end gap-3 border-t border-line bg-surface px-7 py-4">
        {footer}
      </footer>
    </div>
  )
}
