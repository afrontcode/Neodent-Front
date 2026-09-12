import { cn } from '@/lib/cn'

export interface Step {
  /** Rótulo corto, por ejemplo "PASO 1". */
  label: string
  /** Nombre del paso, por ejemplo "Datos generales". */
  title: string
}

interface StepperProps {
  steps: readonly Step[]
  /** Índice del paso en curso, empezando en 0. */
  current: number
}

/**
 * Progreso de un formulario por pasos: una barra por paso y su rótulo debajo.
 * El paso en curso se marca en azul y los ya completados en verde.
 */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex gap-5 max-sm:flex-col max-sm:gap-3">
      {steps.map((step, i) => {
        const active = i === current
        const done = i < current
        return (
          <li key={step.label} className="flex-1">
            <div
              className={cn('h-1 rounded-full', done ? 'bg-success' : active ? 'bg-brand' : 'bg-line')}
              aria-hidden="true"
            />
            <div className="pt-3" aria-current={active ? 'step' : undefined}>
              <div className={cn('text-[0.82rem] font-bold', active ? 'text-brand' : 'text-ink-soft')}>
                {step.label}
              </div>
              <div className={cn('text-[0.9rem]', active ? 'text-brand' : 'text-muted')}>{step.title}</div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
