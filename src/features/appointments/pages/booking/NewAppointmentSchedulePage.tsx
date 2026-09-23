import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Icon } from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { dayName, isoToDMY } from '@/shared/lib/format'
import type { Id } from '@/shared/lib/id'
import { isDentist } from '@/features/users'
import { useData } from '@/legacy/demo-store/useDemoData'
import { availabilityFor, nextSlotFor } from '../../model/availability'
import { BookingLayout } from '../../components/booking/BookingLayout'
import { SpecialistCard } from '../../components/booking/SpecialistCard'
import type { AppointmentDraft } from '../../model/catalog'

/** Cupo elegido: el día y la hora concretos. */
interface Slot {
  fecha: string
  hora: string
}

/** Primer cupo libre de una agenda, para preseleccionar al abrir o al cambiar de especialista. */
function firstSlot(docId: Id): Slot | null {
  const [dia] = availabilityFor(docId)
  return dia ? { fecha: dia.fecha, hora: dia.horas[0] } : null
}

/** Paso 2 de la reserva: con quién y cuándo. */
export function NewAppointmentSchedulePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { users } = useData()

  /** Lo que eligió el paso 1. Sin eso no hay reserva que continuar. */
  const draft = location.state as AppointmentDraft | null

  /** Odontólogos que pueden recibir citas, en el orden del listado. */
  const doctors = useMemo(() => users.filter((u) => isDentist(u) && u.activo), [users])

  const [docId, setDocId] = useState<Id | null>(
    () => doctors.find((d) => nextSlotFor(d.id) !== null)?.id ?? null,
  )
  const [slot, setSlot] = useState<Slot | null>(() => (docId != null ? firstSlot(docId) : null))

  /**
   * Agenda del especialista elegido. Cada odontólogo tiene la suya, así que
   * esto se recalcula al cambiar de especialista; con la API conectada, aquí
   * es donde se pedirá su disponibilidad.
   */
  const dias = useMemo(() => (docId != null ? availabilityFor(docId) : []), [docId])

  if (!draft) return <Navigate to="/mis-citas/nueva" replace />

  /** Al cambiar de especialista se carga su horario y se preselecciona su primer cupo. */
  const selectDoctor = (id: Id) => {
    setDocId(id)
    setSlot(firstSlot(id))
  }

  const goNext = () => {
    if (docId == null || !slot) return
    navigate('/mis-citas/nueva/confirmar', {
      state: { ...draft, docId, fecha: slot.fecha, hora: slot.hora },
    })
  }

  return (
    <BookingLayout
      step={1}
      footer={
        <>
          <Button variant="ghost" onClick={() => navigate('/mis-citas/nueva')}>
            Regresar
          </Button>
          <Button onClick={goNext} disabled={!slot} className="disabled:opacity-60">
            Continuar
          </Button>
        </>
      }
    >
      <section className="mt-6 grid grid-cols-[20rem_1fr] gap-8 rounded-card border border-line bg-surface px-7 py-6 shadow-card max-lg:grid-cols-1 max-sm:px-5">
        <div>
          <h2 className="text-[1.05rem] font-bold text-ink">Selecciona un especialista</h2>

          <div role="radiogroup" aria-label="Especialista" className="mt-4 flex flex-col gap-3">
            {doctors.map((d) => (
              <SpecialistCard
                key={d.id}
                doctor={d}
                proximaCita={nextSlotFor(d.id)}
                selected={d.id === docId}
                onSelect={() => selectDoctor(d.id)}
              />
            ))}

            {doctors.length === 0 && (
              <p className="text-[0.92rem] text-muted">No hay especialistas disponibles.</p>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="text-[1.05rem] font-bold text-ink">Elige fecha y hora</h2>

          <div role="radiogroup" aria-label="Fecha y hora" className="mt-4 flex flex-col">
            {dias.map((dia) => (
              <div key={dia.fecha} className="border-b border-line py-4 first:pt-0 last:border-0 last:pb-0">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[1rem] font-bold text-ink">{dayName(dia.fecha)}</span>
                  <span className="text-[0.92rem] text-muted">{isoToDMY(dia.fecha)}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2">
                  {dia.horas.map((hora, i) => {
                    const active = slot?.fecha === dia.fecha && slot?.hora === hora
                    return (
                      <span key={hora} className="flex items-center">
                        {i > 0 && <span className="mr-1 h-5 w-px bg-line" aria-hidden="true" />}
                        <button
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setSlot({ fecha: dia.fecha, hora })}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-[0.9rem] transition',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                            active ? 'text-brand' : 'text-ink-soft hover:bg-hover',
                          )}
                        >
                          <span
                            className={cn(
                              'grid size-[18px] flex-none place-items-center rounded-full border',
                              active ? 'border-brand bg-brand' : 'border-muted',
                            )}
                            aria-hidden="true"
                          >
                            {active && <span className="size-1.5 rounded-full bg-white" />}
                          </span>
                          {hora}
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}

            {dias.length === 0 && (
              <div className="grid place-items-center gap-3 py-12 text-center text-muted">
                <Icon name="calendar" size={28} />
                <p className="text-[0.95rem]">Este especialista todavía no tiene horarios disponibles.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </BookingLayout>
  )
}
