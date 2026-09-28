import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  AnimatedSelect,
  Avatar,
  Badge,
  Button,
  Card,
  ClockTimePicker,
  ConfirmDialog,
  Icon,
  PageHead,
  ProtectedImage,
  Toast,
  type ToastAviso,
} from '@/shared/components/ui'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/features/auth/model/useAuth'
import { bookingApi, type BookingBranch } from '@/features/appointments/api/bookingApi'
import {
  schedulesApi,
  type HorarioOdontologo,
  type HorarioOdontologoCatalogo,
  type HorarioOdontologoInput,
} from '../api/schedulesApi'

const DIAS = [
  { value: '1', label: 'Lunes', short: 'LUN' },
  { value: '2', label: 'Martes', short: 'MAR' },
  { value: '3', label: 'Miércoles', short: 'MIÉ' },
  { value: '4', label: 'Jueves', short: 'JUE' },
  { value: '5', label: 'Viernes', short: 'VIE' },
  { value: '6', label: 'Sábado', short: 'SÁB' },
  { value: '7', label: 'Domingo', short: 'DOM' },
] as const

type Formulario = {
  odontologoEspecialidadId: string
  sedeId: string
  diaSemana: string
  horaInicio: string
  horaFin: string
}

const VACIO: Formulario = {
  odontologoEspecialidadId: '',
  sedeId: '',
  diaSemana: '1',
  horaInicio: '08:00',
  horaFin: '13:00',
}

const nombreCompleto = (item: HorarioOdontologoCatalogo) =>
  [item.nombres, item.apellidoPaterno, item.apellidoMaterno].filter(Boolean).join(' ')

const horaCorta = (hora: string) => hora.slice(0, 5)

const hora12 = (hora: string) => {
  const [hStr = '00', mStr = '00'] = hora.split(':')
  const h = Number.parseInt(hStr, 10)
  const m = Number.parseInt(mStr, 10)
  return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

export function SchedulesPage() {
  const { accessToken } = useAuth()

  const [catalogo, setCatalogo] = useState<HorarioOdontologoCatalogo[]>([])
  const [sedes, setSedes] = useState<BookingBranch[]>([])
  const [horarios, setHorarios] = useState<HorarioOdontologo[]>([])

  const [filtroRelacion, setFiltroRelacion] = useState('')
  const [filtroSede, setFiltroSede] = useState('')
  const [diaElegido, setDiaElegido] = useState<string>('1')

  const [form, setForm] = useState<Formulario>(VACIO)
  const [editando, setEditando] = useState<number | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [confirmar, setConfirmar] = useState<HorarioOdontologo | null>(null)

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState<ToastAviso | null>(null)
  const [actualizacion, setActualizacion] = useState(0)

  // Carga de catálogo de odontólogos, sedes y horarios
  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      setError('No se encontró una sesión activa.')
      return
    }

    let activo = true
    setLoading(true)
    setError('')

    Promise.all([
      schedulesApi.catalogoOdontologos(accessToken),
      bookingApi.sedes(accessToken),
      schedulesApi.listar(accessToken),
    ])
      .then(([catalogoData, sedesData, horariosData]) => {
        if (!activo) return

        setCatalogo(catalogoData)
        setSedes(sedesData)
        setHorarios(horariosData)

        setFiltroRelacion(actual =>
          actual && catalogoData.some(item => String(item.odontologoEspecialidadId) === actual)
            ? actual
            : catalogoData[0]
              ? String(catalogoData[0].odontologoEspecialidadId)
              : '',
        )
      })
      .catch(e => {
        if (activo) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar los horarios.')
        }
      })
      .finally(() => {
        if (activo) setLoading(false)
      })

    return () => {
      activo = false
    }
  }, [accessToken, actualizacion])

  const relacionSeleccionada = useMemo(
    () =>
      catalogo.find(item => String(item.odontologoEspecialidadId) === filtroRelacion) ?? null,
    [catalogo, filtroRelacion],
  )

  const horariosVisibles = useMemo(() => {
    return horarios.filter(h => {
      if (filtroRelacion && h.odontologoEspecialidadId !== Number(filtroRelacion)) {
        return false
      }
      if (filtroSede && h.sedeId !== Number(filtroSede)) {
        return false
      }
      return true
    })
  }, [horarios, filtroRelacion, filtroSede])



  const turnosDiaElegido = useMemo(() => {
    return horariosVisibles
      .filter(h => h.diaSemana === Number(diaElegido))
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }, [horariosVisibles, diaElegido])

  const manana = useMemo(
    () => turnosDiaElegido.filter(h => Number.parseInt(h.horaInicio.slice(0, 2), 10) < 12),
    [turnosDiaElegido],
  )

  const tarde = useMemo(
    () => turnosDiaElegido.filter(h => Number.parseInt(h.horaInicio.slice(0, 2), 10) >= 12),
    [turnosDiaElegido],
  )

  const opcionesOdontologos = catalogo.map(item => ({
    value: String(item.odontologoEspecialidadId),
    label: `${nombreCompleto(item)} · ${item.especialidadNombre}`,
  }))

  const opcionesSedes = sedes.map(sede => ({
    value: String(sede.id),
    label: sede.nombre,
  }))

  const sedeNombre = (id: number) =>
    sedes.find(sede => sede.id === id)?.nombre ?? `Sede #${id}`

  const diaActualInfo = DIAS.find(d => d.value === diaElegido) ?? DIAS[0]

  const abrirNuevo = (dia?: number) => {
    const relacionId =
      filtroRelacion || (catalogo[0] ? String(catalogo[0].odontologoEspecialidadId) : '')
    const sedeId = filtroSede || (sedes[0] ? String(sedes[0].id) : '')

    setForm({
      ...VACIO,
      odontologoEspecialidadId: relacionId,
      sedeId,
      diaSemana: dia ? String(dia) : diaElegido,
      horaInicio: '08:00',
      horaFin: '13:00',
    })

    setEditando(null)
    setMostrarForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const abrirEditar = (horario: HorarioOdontologo) => {
    setForm({
      odontologoEspecialidadId: String(horario.odontologoEspecialidadId),
      sedeId: String(horario.sedeId),
      diaSemana: String(horario.diaSemana),
      horaInicio: horaCorta(horario.horaInicio),
      horaFin: horaCorta(horario.horaFin),
    })

    setEditando(horario.id)
    setMostrarForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const cerrarForm = () => {
    if (guardando) return
    setMostrarForm(false)
    setEditando(null)
  }

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!accessToken || guardando) return

    setGuardando(true)

    try {
      if (!form.odontologoEspecialidadId || !form.sedeId) {
        throw new Error('Selecciona el odontólogo, la especialidad y la sede.')
      }

      if (!form.horaInicio || !form.horaFin) {
        throw new Error('Ingresa la hora de inicio y la hora de fin.')
      }

      if (form.horaFin <= form.horaInicio) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio.')
      }

      const data: HorarioOdontologoInput = {
        odontologoEspecialidadId: Number(form.odontologoEspecialidadId),
        sedeId: Number(form.sedeId),
        diaSemana: Number(form.diaSemana),
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
      }

      const esNuevo = editando === null

      const resultado = esNuevo
        ? await schedulesApi.crear(accessToken, data)
        : await schedulesApi.actualizar(accessToken, editando, data)

      setHorarios(actual => {
        const siguiente = esNuevo
          ? [...actual, resultado]
          : actual.map(h => (h.id === resultado.id ? resultado : h))

        return siguiente.sort(
          (a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio),
        )
      })

      setFiltroRelacion(String(resultado.odontologoEspecialidadId))
      setDiaElegido(String(resultado.diaSemana))
      setMostrarForm(false)
      setEditando(null)

      setAviso({
        tipo: 'success',
        texto: esNuevo
          ? 'Horario registrado correctamente.'
          : 'Horario actualizado correctamente.',
      })
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'No se pudo guardar el horario.'
      setAviso({
        tipo: 'error',
        texto: mensaje,
      })
    } finally {
      setGuardando(false)
    }
  }

  const desactivar = async () => {
    if (!accessToken || !confirmar || procesando) return

    const horario = confirmar
    setProcesando(true)

    try {
      await schedulesApi.desactivar(accessToken, horario.id)

      setHorarios(actual => actual.filter(h => h.id !== horario.id))
      setConfirmar(null)

      setAviso({
        tipo: 'success',
        texto: 'Horario desactivado correctamente.',
      })
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'No se pudo desactivar el horario.'
      setConfirmar(null)
      setAviso({
        tipo: 'error',
        texto: mensaje,
      })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <>
      <PageHead
        title="Horarios de odontólogos"
        description="Configura la jornada semanal de cada odontólogo por especialidad y sede."
      />

      {/* TOAST FLOTANTE */}
      <Toast aviso={aviso} onClose={() => setAviso(null)} />

      {/* FORMULARIO DE REGISTRO / EDICIÓN */}
      <AnimatePresence>
        {mostrarForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <Card className="border-brand/30 p-5 sm:p-6 shadow-md">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">
                    {editando === null ? 'Registrar horario de atención' : 'Editar horario de atención'}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Selecciona el odontólogo, la sede, el día y define las horas con el selector de reloj.
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Cerrar formulario"
                  onClick={cerrarForm}
                  disabled={guardando}
                  className="rounded-lg p-2 text-muted transition hover:bg-alt hover:text-ink"
                >
                  <Icon name="x" size={20} />
                </button>
              </div>

              <form onSubmit={e => void guardar(e)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="min-w-0 sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">
                    Odontólogo y especialidad
                  </span>
                  <AnimatedSelect
                    value={form.odontologoEspecialidadId}
                    options={opcionesOdontologos}
                    onChange={valor =>
                      setForm(actual => ({
                        ...actual,
                        odontologoEspecialidadId: valor,
                      }))
                    }
                    label="Odontólogo y especialidad"
                    disabled={guardando}
                  />
                </label>

                <label className="min-w-0">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Sede</span>
                  <AnimatedSelect
                    value={form.sedeId}
                    options={opcionesSedes}
                    onChange={valor =>
                      setForm(actual => ({
                        ...actual,
                        sedeId: valor,
                      }))
                    }
                    label="Sede"
                    disabled={guardando}
                  />
                </label>

                <label className="min-w-0">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Día de la semana</span>
                  <AnimatedSelect
                    value={form.diaSemana}
                    options={DIAS.map(dia => ({
                      value: dia.value,
                      label: dia.label,
                    }))}
                    onChange={valor =>
                      setForm(actual => ({
                        ...actual,
                        diaSemana: valor,
                      }))
                    }
                    label="Día de atención"
                    disabled={guardando}
                  />
                </label>

                {/* HORA DE INICIO CON CLOCK TIME PICKER */}
                <div className="min-w-0">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Hora de inicio</span>
                  <ClockTimePicker
                    value={form.horaInicio}
                    onChange={valor =>
                      setForm(actual => ({
                        ...actual,
                        horaInicio: valor,
                      }))
                    }
                    label="Hora de inicio"
                    disabled={guardando}
                  />
                </div>

                {/* HORA DE FIN CON CLOCK TIME PICKER */}
                <div className="min-w-0">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Hora de fin</span>
                  <ClockTimePicker
                    value={form.horaFin}
                    onChange={valor =>
                      setForm(actual => ({
                        ...actual,
                        horaFin: valor,
                      }))
                    }
                    label="Hora de fin"
                    disabled={guardando}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5 sm:col-span-2 lg:col-span-4">
                  <Button variant="ghost" onClick={cerrarForm} disabled={guardando}>
                    Cancelar
                  </Button>

                  <Button type="submit" disabled={guardando}>
                    {guardando
                      ? 'Guardando…'
                      : editando === null
                        ? 'Registrar horario'
                        : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-visible">
        {/* BARRA SUPERIOR DE FILTROS */}
        <div className="border-b border-line p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-ink sm:text-lg">Jornada semanal de atención</h2>
              <p className="mt-1 text-xs text-muted">
                Selecciona un odontólogo y un día de la semana para consultar y organizar sus turnos.
              </p>
            </div>

            <div className="grid w-full gap-2.5 sm:grid-cols-2 lg:w-auto lg:grid-cols-[minmax(18rem,24rem)_13rem]">
              <AnimatedSelect
                value={filtroRelacion}
                options={opcionesOdontologos}
                onChange={setFiltroRelacion}
                label="Odontólogo y especialidad"
                placeholder="Selecciona un odontólogo"
              />

              <AnimatedSelect
                value={filtroSede}
                options={[
                  { value: '', label: 'Todas las sedes' },
                  ...opcionesSedes,
                ]}
                onChange={setFiltroSede}
                label="Filtrar por sede"
              />
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-muted">
            <Icon name="spinner" size={22} className="animate-spin text-brand" />
            Cargando horarios de atención…
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p role="alert" className="text-sm text-danger">{error}</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setActualizacion(n => n + 1)}
            >
              Reintentar
            </Button>
          </div>
        ) : catalogo.length === 0 ? (
          <div className="p-10 text-center">
            <Icon name="clock" size={36} className="mx-auto text-muted" />
            <p className="mt-3 font-semibold text-ink">No hay odontólogos activos con especialidades.</p>
            <p className="mt-1 text-sm text-muted">
              Asigna al menos una especialidad activa a un odontólogo antes de configurar horarios.
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* CABECERA DESTACADA DEL ODONTÓLOGO */}
            {relacionSeleccionada && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/20 bg-gradient-to-r from-brand-soft/80 via-brand-soft/40 to-surface p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-3.5">
                  {relacionSeleccionada.tieneFoto ? (
                    <div className="size-13 shrink-0 overflow-hidden rounded-full border border-line bg-alt shadow-sm">
                      <ProtectedImage
                        path={`/api/odontologos/${relacionSeleccionada.odontologoId}/foto`}
                        accessToken={accessToken}
                        alt={`Dr(a). ${nombreCompleto(relacionSeleccionada)}`}
                        className="size-full object-cover"
                        fallback={
                          <Avatar
                            nombre={relacionSeleccionada.nombres}
                            apellido={relacionSeleccionada.apellidoPaterno}
                            seed={relacionSeleccionada.odontologoId}
                            size={52}
                            animate="hover"
                            trackCursor={false}
                          />
                        }
                      />
                    </div>
                  ) : (
                    <Avatar
                      nombre={relacionSeleccionada.nombres}
                      apellido={relacionSeleccionada.apellidoPaterno}
                      seed={relacionSeleccionada.odontologoId}
                      size={52}
                      animate="hover"
                      trackCursor={false}
                    />
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-ink sm:text-lg">
                        Dr(a). {nombreCompleto(relacionSeleccionada)}
                      </h3>
                      <Badge tone="blue">{relacionSeleccionada.especialidadNombre}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {horariosVisibles.length === 0
                        ? 'Sin turnos asignados aún'
                        : `${horariosVisibles.length} bloque${horariosVisibles.length === 1 ? '' : 's'} de atención configurado${horariosVisibles.length === 1 ? '' : 's'}`}
                      {filtroSede ? ` · Filtrado por ${sedeNombre(Number(filtroSede))}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 max-sm:w-full">
                  {relacionSeleccionada.numeroColegiatura && (
                    <div className="rounded-xl border border-line bg-surface/90 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-2xs">
                      <span className="text-muted mr-1.5 font-medium">COP:</span>
                      <span className="font-mono font-bold text-ink">
                        {relacionSeleccionada.numeroColegiatura}
                      </span>
                    </div>
                  )}
                  <div className="rounded-xl border border-brand/20 bg-brand-soft/80 px-3.5 py-1.5 text-xs font-semibold text-brand shadow-2xs">
                    {horariosVisibles.length} turno{horariosVisibles.length === 1 ? '' : 's'} en la semana
                  </div>
                </div>
              </div>
            )}

            {/* ===== SELECTOR DE DÍAS DE LA SEMANA (ESTILO COMPARTIDO EN LA IMAGEN) ===== */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">Días de la semana</h3>
                <span className="text-xs text-muted">
                  Selecciona un día para gestionar sus turnos
                </span>
              </div>

              {/* BARRA DE 7 DÍAS CON SCROLL EN MÓVIL Y FLEX EN ESCRITORIO */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:gap-3">
                {DIAS.map(dia => {
                  const tieneHorarios = horariosVisibles.some(h => h.diaSemana === Number(dia.value))
                  const seleccionado = dia.value === diaElegido
                  const totalDia = horariosVisibles.filter(h => h.diaSemana === Number(dia.value)).length

                  return (
                    <button
                      key={dia.value}
                      type="button"
                      aria-pressed={seleccionado}
                      onClick={() => setDiaElegido(dia.value)}
                      className={cn(
                        'flex min-w-[4.75rem] cursor-pointer flex-1 flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                        seleccionado
                          ? 'border-brand bg-brand text-white shadow-md ring-2 ring-brand/30'
                          : tieneHorarios
                            ? 'border-line bg-surface text-ink hover:border-brand/50 hover:bg-brand-soft/30'
                            : 'border-line/70 bg-surface/60 text-ink/75 hover:border-brand/40 hover:bg-alt',
                      )}
                    >
                      <span className={cn(
                        'text-xs font-bold tracking-wider uppercase',
                        seleccionado ? 'text-white/90' : 'text-muted',
                      )}>
                        {dia.short}
                      </span>

                      <span className={cn(
                        'text-base font-extrabold sm:text-lg',
                        seleccionado ? 'text-white' : 'text-ink',
                      )}>
                        {dia.label.slice(0, 3)}
                      </span>

                      {/* PUNTO AZUL INDICADOR DE HORARIOS DISPONIBLES */}
                      <span
                        className={cn(
                          'size-1.5 rounded-full transition-colors',
                          seleccionado
                            ? 'bg-white'
                            : tieneHorarios
                              ? 'bg-brand'
                              : 'bg-transparent',
                        )}
                        title={tieneHorarios ? `${totalDia} turnos configurados` : undefined}
                      />
                    </button>
                  )
                })}
              </div>

              <p className="mt-2 text-xs text-muted">
                El punto azul indica días con horarios de atención configurados.
              </p>
            </div>

            {/* ===== DETALLE DE HORARIOS DEL DÍA SELECCIONADO ===== */}
            <div className="mt-6 border-t border-line pt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${filtroRelacion}-${diaElegido}-${turnosDiaElegido.length}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-ink sm:text-lg">
                        {diaActualInfo.label}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {turnosDiaElegido.length === 0
                          ? 'Sin turnos asignados para este día.'
                          : `${turnosDiaElegido.length} bloque${turnosDiaElegido.length === 1 ? '' : 's'} de atención configurado${turnosDiaElegido.length === 1 ? '' : 's'}.`}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      icon="plus"
                      onClick={() => abrirNuevo(Number(diaElegido))}
                      disabled={loading || guardando || procesando}
                    >
                      Agregar turno el {diaActualInfo.label}
                    </Button>
                  </div>

                  {turnosDiaElegido.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-line bg-alt/50 p-8 text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface text-muted shadow-xs">
                        <Icon name="clock" size={24} />
                      </div>
                      <p className="mt-3 font-semibold text-ink">
                        No hay horarios configurados para el {diaActualInfo.label}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Puedes asignar turnos usando el botón «Agregar turno el {diaActualInfo.label}».
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-6">
                      {/* GRUPO MAÑANA */}
                      {manana.length > 0 && (
                        <div>
                          <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-muted">
                            <Icon name="clock" size={15} className="text-brand" />
                            TURNO MAÑANA
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {manana.map(horario => (
                              <div
                                key={horario.id}
                                className="group flex flex-col justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-brand/50 hover:shadow-md"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <span className="text-base font-extrabold tabular-nums text-brand sm:text-lg">
                                      {hora12(horario.horaInicio)} – {hora12(horario.horaFin)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      title="Editar turno"
                                      onClick={() => abrirEditar(horario)}
                                      className="rounded-lg p-1.5 text-muted transition hover:bg-alt hover:text-brand"
                                    >
                                      <Icon name="edit" size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Desactivar turno"
                                      onClick={() => setConfirmar(horario)}
                                      className="rounded-lg p-1.5 text-muted transition hover:bg-alt hover:text-danger"
                                    >
                                      <Icon name="trash" size={15} />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 border-t border-line/70 pt-2.5">
                                  <Icon name="mapPin" size={15} className="text-muted shrink-0" />
                                  <span className="truncate text-xs font-semibold text-ink">
                                    {sedeNombre(horario.sedeId)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* GRUPO TARDE */}
                      {tarde.length > 0 && (
                        <div>
                          <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-muted">
                            <Icon name="clock" size={15} className="text-brand" />
                            TURNO TARDE
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {tarde.map(horario => (
                              <div
                                key={horario.id}
                                className="group flex flex-col justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-brand/50 hover:shadow-md"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <span className="text-base font-extrabold tabular-nums text-brand sm:text-lg">
                                      {hora12(horario.horaInicio)} – {hora12(horario.horaFin)}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      title="Editar turno"
                                      onClick={() => abrirEditar(horario)}
                                      className="rounded-lg p-1.5 text-muted transition hover:bg-alt hover:text-brand"
                                    >
                                      <Icon name="edit" size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Desactivar turno"
                                      onClick={() => setConfirmar(horario)}
                                      className="rounded-lg p-1.5 text-muted transition hover:bg-alt hover:text-danger"
                                    >
                                      <Icon name="trash" size={15} />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 border-t border-line/70 pt-2.5">
                                  <Icon name="mapPin" size={15} className="text-muted shrink-0" />
                                  <span className="truncate text-xs font-semibold text-ink">
                                    {sedeNombre(horario.sedeId)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </Card>

      {/* DIÁLOGO DE CONFIRMACIÓN PARA DESACTIVAR */}
      <ConfirmDialog
        open={confirmar !== null}
        title="¿Desactivar horario de atención?"
        description={
          confirmar
            ? `El turno de ${hora12(confirmar.horaInicio)} a ${hora12(confirmar.horaFin)} dejará de estar disponible para citas de pacientes.`
            : undefined
        }
        confirmLabel={procesando ? 'Desactivando…' : 'Desactivar horario'}
        cancelLabel="Cancelar"
        onCancel={() => {
          if (!procesando) setConfirmar(null)
        }}
        onConfirm={() => void desactivar()}
      />
    </>
  )
}