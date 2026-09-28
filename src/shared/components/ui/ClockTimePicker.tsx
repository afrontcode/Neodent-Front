import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Icon } from './Icon'
import { cn } from '@/shared/lib/cn'

interface ClockTimePickerProps {
  value: string // 'HH:mm' en formato 24 horas (ej. '08:00', '14:30')
  onChange: (value: string) => void
  label?: string
  disabled?: boolean
  className?: string
}

// Convertir de 'HH:mm' (24h) a { hour12: number, minute: number, period: 'AM' | 'PM' }
function parse24to12(time: string) {
  const [hStr = '08', mStr = '00'] = (time || '08:00').split(':')
  const h24 = Number.parseInt(hStr, 10) || 0
  const minute = Number.parseInt(mStr, 10) || 0

  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM'
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12

  return { hour12, minute, period }
}

// Convertir de { hour12, minute, period } a 'HH:mm' (24h)
function format12to24(hour12: number, minute: number, period: 'AM' | 'PM') {
  let h24 = hour12 % 12
  if (period === 'PM') h24 += 12
  const hh = String(h24).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return `${hh}:${mm}`
}

export function ClockTimePicker({
  value,
  onChange,
  label = 'Hora',
  disabled = false,
  className,
}: ClockTimePickerProps) {
  const [abierto, setAbierto] = useState(false)
  const [modo, setModo] = useState<'hours' | 'minutes'>('hours')

  const parsed = parse24to12(value)
  const [tempHour, setTempHour] = useState(parsed.hour12)
  const [tempMinute, setTempMinute] = useState(parsed.minute)
  const [tempPeriod, setTempPeriod] = useState(parsed.period)

  const clockRef = useRef<HTMLDivElement>(null)

  // Sincronizar estado temporal al abrir
  useEffect(() => {
    if (abierto) {
      const p = parse24to12(value)
      setTempHour(p.hour12)
      setTempMinute(p.minute)
      setTempPeriod(p.period)
      setModo('hours')
    }
  }, [abierto, value])

  const aceptar = () => {
    onChange(format12to24(tempHour, tempMinute, tempPeriod))
    setAbierto(false)
  }

  const cancelar = () => {
    setAbierto(false)
  }

  // Dimensiones del reloj
  const DIAL_SIZE = 240
  const CENTER = DIAL_SIZE / 2
  const RADIUS = 88

  // Calcular posición o interacción al hacer clic en el dial
  const handleDialClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clockRef.current) return
    const rect = clockRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - CENTER
    const y = e.clientY - rect.top - CENTER

    // Ángulo en grados respecto a las 12:00
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90
    if (deg < 0) deg += 360

    if (modo === 'hours') {
      let h = Math.round(deg / 30)
      if (h === 0) h = 12
      setTempHour(h)
      // Al elegir hora, pasar automáticamente a minutos para fluidez
      setModo('minutes')
    } else {
      let m = Math.round(deg / 6)
      if (m === 60) m = 0
      setTempMinute(m)
    }
  }

  // Aguja del reloj
  const handAngle =
    modo === 'hours'
      ? (tempHour % 12) * 30
      : tempMinute * 6

  // Texto para el input gatillo
  const textoDisplay = `${String(parsed.hour12).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')} ${parsed.period}`

  return (
    <div className={cn('relative', className)}>
      {/* BOTÓN DISPARADOR CON ESTILO UNIFICADO */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAbierto(true)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-xl border border-line bg-surface px-3.5 text-left text-sm text-ink transition',
          'hover:border-brand/40 hover:bg-hover focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
          disabled && 'cursor-not-allowed opacity-50',
          abierto && 'border-brand ring-2 ring-brand/20',
        )}
        aria-label={label}
      >
        <span className="font-semibold tabular-nums">{textoDisplay}</span>
        <Icon name="clock" size={17} className="text-muted" />
      </button>

      {/* DIÁLOGO MODAL TIPO RELOJ */}
      <AnimatePresence>
        {abierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* FONDO OSCURECIDO */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelar}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            {/* CONTENEDOR DEL RELOJ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-[320px] rounded-3xl border border-line bg-surface p-6 shadow-2xl"
            >
              <p className="text-xs font-bold tracking-wider uppercase text-muted">
                Seleccionar hora
              </p>

              {/* PANTALLA DIGITAL (HORA : MINUTOS + AM/PM) */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {/* HORA */}
                  <button
                    type="button"
                    onClick={() => setModo('hours')}
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-3xl font-extrabold tabular-nums transition',
                      modo === 'hours'
                        ? 'bg-brand-soft text-brand ring-2 ring-brand/30'
                        : 'bg-alt text-ink hover:bg-alt/80',
                    )}
                  >
                    {String(tempHour).padStart(2, '0')}
                  </button>

                  <span className="text-2xl font-bold text-muted">:</span>

                  {/* MINUTOS */}
                  <button
                    type="button"
                    onClick={() => setModo('minutes')}
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-3xl font-extrabold tabular-nums transition',
                      modo === 'minutes'
                        ? 'bg-brand-soft text-brand ring-2 ring-brand/30'
                        : 'bg-alt text-ink hover:bg-alt/80',
                    )}
                  >
                    {String(tempMinute).padStart(2, '0')}
                  </button>
                </div>

                {/* SELECTOR AM / PM */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-alt text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTempPeriod('AM')}
                    className={cn(
                      'px-3 py-2 transition',
                      tempPeriod === 'AM'
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempPeriod('PM')}
                    className={cn(
                      'px-3 py-2 transition',
                      tempPeriod === 'PM'
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-muted hover:text-ink',
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* DIAL DEL RELOJ CIRCULAR */}
              <div className="mt-6 flex justify-center">
                <div
                  ref={clockRef}
                  onClick={handleDialClick}
                  style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
                  className="relative cursor-pointer select-none rounded-full bg-alt/70 transition hover:bg-alt"
                >
                  {/* PUNTO CENTRAL */}
                  <div className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />

                  {/* AGUJA Y SELECTOR */}
                  <div
                    style={{
                      transform: `rotate(${handAngle}deg)`,
                      transformOrigin: 'bottom center',
                      height: RADIUS,
                      left: 'calc(50% - 1px)',
                      top: 'calc(50% - 88px)',
                    }}
                    className="pointer-events-none absolute w-[2px] bg-brand transition-transform duration-150"
                  >
                    {/* BOLA SELECTORA EN LA PUNTA */}
                    <div className="absolute -top-4 -left-4 size-8.5 rounded-full bg-brand shadow-md" />
                  </div>

                  {/* NÚMEROS DEL DIAL */}
                  {modo === 'hours'
                    ? // HORAS 1..12
                      Array.from({ length: 12 }, (_, i) => {
                        const h = i + 1
                        const rad = ((h * 30 - 90) * Math.PI) / 180
                        const x = CENTER + RADIUS * Math.cos(rad)
                        const y = CENTER + RADIUS * Math.sin(rad)
                        const activo = tempHour === h

                        return (
                          <div
                            key={h}
                            style={{
                              left: `${x}px`,
                              top: `${y}px`,
                            }}
                            className={cn(
                              'pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-sm font-semibold tabular-nums',
                              activo ? 'font-bold text-white' : 'text-ink',
                            )}
                          >
                            {h}
                          </div>
                        )
                      })
                    : // MINUTOS EN INTERVALOS DE 5 (00, 05, 10, ... 55)
                      Array.from({ length: 12 }, (_, i) => {
                        const m = i * 5
                        const rad = ((m * 6 - 90) * Math.PI) / 180
                        const x = CENTER + RADIUS * Math.cos(rad)
                        const y = CENTER + RADIUS * Math.sin(rad)
                        const activo = tempMinute === m

                        return (
                          <div
                            key={m}
                            style={{
                              left: `${x}px`,
                              top: `${y}px`,
                            }}
                            className={cn(
                              'pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-xs font-semibold tabular-nums',
                              activo ? 'font-bold text-white' : 'text-ink',
                            )}
                          >
                            {String(m).padStart(2, '0')}
                          </div>
                        )
                      })}
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={cancelar}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-muted transition hover:bg-alt hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={aceptar}
                  className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark"
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
