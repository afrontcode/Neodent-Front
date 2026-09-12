import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Icon, Stepper, type Step } from '@/components/ui'
import { cn } from '@/lib/cn'
import { BRANCHES, SERVICES } from './catalog'

const STEPS: readonly Step[] = [
  { label: 'PASO 1', title: 'Datos generales' },
  { label: 'PASO 2', title: 'Fecha y hora' },
  { label: 'PASO 3', title: 'Confirmar' },
]

/** Paso 1 de la reserva: qué servicio necesita el paciente y en qué sede. */
export function NewAppointmentPage() {
  const navigate = useNavigate()

  const [servicio, setServicio] = useState(SERVICES[0].id)
  const [sede, setSede] = useState(BRANCHES[0].nombre)

  const direccion = BRANCHES.find((b) => b.nombre === sede)?.direccion

  const goNext = () => {
    navigate('/mis-citas/nueva/fecha-y-hora', { state: { servicio, sede } })
  }

  return (
    /* Pantalla a sangre: los márgenes negativos anulan el relleno del área de
       contenido (p-7 en AppShell) para que la barra de acciones llegue a los
       bordes, y el alto recupera esos 3.5rem (1.75 arriba + 1.75 abajo) para
       que el pie quede anclado sin dejar scroll sobrante. */
    <div className="-m-7 flex h-[calc(100%+3.5rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-7 pt-7">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[1.9rem] leading-tight font-bold tracking-tight">Programar una cita</h1>
          <Button variant="ghost" icon="logout" onClick={() => navigate('/mis-citas')}>
            Salir
          </Button>
        </header>

        <Stepper steps={STEPS} current={0} />

        <section className="mt-6 rounded-card border border-line bg-surface px-7 py-6 shadow-card max-sm:px-5">
          <h2 className="text-[1.05rem] font-bold text-ink">Selecciona un servicio</h2>

          <div
            role="radiogroup"
            aria-label="Servicio"
            className="mt-4 flex flex-wrap gap-4 max-sm:grid max-sm:grid-cols-2"
          >
            {SERVICES.map((s) => {
              const active = s.id === servicio
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setServicio(s.id)}
                  className={cn(
                    'w-[9.5rem] cursor-pointer rounded-card px-4 py-5 text-center transition max-sm:w-full',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                    active
                      ? 'border border-brand bg-brand-soft'
                      : 'border border-transparent bg-alt hover:bg-hover',
                  )}
                >
                  <Icon
                    name={s.icon}
                    size={40}
                    strokeWidth={1.5}
                    className={cn('mx-auto', active ? 'text-brand' : 'text-ink-soft')}
                  />
                  <div className={cn('mt-3 text-[0.95rem] font-bold', active ? 'text-brand' : 'text-ink')}>
                    {s.nombre}
                  </div>
                  <div className="mt-0.5 text-[0.8rem] text-muted">{s.detalle}</div>
                </button>
              )
            })}
          </div>

          <h2 className="mt-7 text-[1.05rem] font-bold text-ink">¿Dónde quieres atenderte?</h2>

          <div role="radiogroup" aria-label="Sede" className="mt-4 flex flex-wrap gap-2.5">
            {BRANCHES.map((b) => {
              const active = b.nombre === sede
              return (
                <button
                  key={b.nombre}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSede(b.nombre)}
                  className={cn(
                    'cursor-pointer rounded-full px-5 py-2 text-[0.88rem] transition',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
                    active
                      ? 'bg-brand font-bold text-white'
                      : 'border border-line bg-surface text-ink-soft hover:bg-hover hover:text-ink',
                  )}
                >
                  {b.nombre}
                </button>
              )
            })}
          </div>

          {direccion && <p className="mt-3 text-[0.85rem] text-muted">{direccion}</p>}
        </section>
      </div>

      <footer className="flex flex-none justify-end border-t border-line bg-surface px-7 py-4">
        <Button onClick={goNext}>Continuar</Button>
      </footer>
    </div>
  )
}
