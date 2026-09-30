import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  Icon,
  PageHead,
  Toast,
  type ToastAviso,
} from '@/shared/components/ui'
import { useAuth } from '@/features/auth/model/useAuth'
import {
  blockTypesApi,
  type BlockType,
  type BlockTypeInput,
} from '../api/blockTypesApi'

type Formulario = {
  codigo: string
  nombre: string
  descripcion: string
  requiereOdontologo: boolean
  requiereSede: boolean
  permiteOdontologo: boolean
  permiteSede: boolean
}

const VACIO: Formulario = {
  codigo: '',
  nombre: '',
  descripcion: '',
  requiereOdontologo: false,
  requiereSede: false,
  permiteOdontologo: true,
  permiteSede: true,
}

const normalizarCodigo = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

export function BlockTypesPage() {
  const { accessToken } = useAuth()

  const [tipos, setTipos] = useState<BlockType[]>([])
  const [form, setForm] = useState<Formulario>(VACIO)
  const [editando, setEditando] = useState<number | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [confirmarEstado, setConfirmarEstado] = useState<BlockType | null>(null)

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState<ToastAviso | null>(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      setError('No se encontró una sesión activa.')
      return
    }

    let activo = true
    setLoading(true)
    setError('')

    blockTypesApi
      .listarTodos(accessToken)
      .then(data => {
        if (activo) setTipos(data)
      })
      .catch(e => {
        if (activo) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar los tipos de bloqueo.')
        }
      })
      .finally(() => {
        if (activo) setLoading(false)
      })

    return () => {
      activo = false
    }
  }, [accessToken, refresh])

  const activos = useMemo(() => tipos.filter(tipo => tipo.activo).length, [tipos])

  const abrirNuevo = () => {
    setForm(VACIO)
    setEditando(null)
    setMostrarForm(true)
    setAviso(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const abrirEditar = (tipo: BlockType) => {
    setForm({
      codigo: tipo.codigo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion ?? '',
      requiereOdontologo: tipo.requiereOdontologo,
      requiereSede: tipo.requiereSede,
      permiteOdontologo: tipo.permiteOdontologo,
      permiteSede: tipo.permiteSede,
    })
    setEditando(tipo.id)
    setMostrarForm(true)
    setAviso(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cerrarForm = () => {
    if (guardando) return
    setMostrarForm(false)
    setEditando(null)
  }

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!accessToken || guardando) return

    setGuardando(true)
    setAviso(null)

    try {
      const codigo = normalizarCodigo(form.codigo)
      const nombre = form.nombre.trim()

      if (!codigo) throw new Error('Ingresa un código válido.')
      if (!nombre) throw new Error('Ingresa el nombre del tipo de bloqueo.')

      if (form.requiereOdontologo && !form.permiteOdontologo) {
        throw new Error('Si el odontólogo es obligatorio, también debe estar permitido.')
      }

      if (form.requiereSede && !form.permiteSede) {
        throw new Error('Si la sede es obligatoria, también debe estar permitida.')
      }

      const data: BlockTypeInput = {
        codigo,
        nombre,
        descripcion: form.descripcion.trim() || null,
        requiereOdontologo: form.requiereOdontologo,
        requiereSede: form.requiereSede,
        permiteOdontologo: form.permiteOdontologo,
        permiteSede: form.permiteSede,
      }

      const esNuevo = editando === null
      const resultado = esNuevo
        ? await blockTypesApi.crear(accessToken, data)
        : await blockTypesApi.actualizar(accessToken, editando, data)

      setTipos(actual => {
        const siguiente = esNuevo
          ? [...actual, resultado]
          : actual.map(tipo => (tipo.id === resultado.id ? resultado : tipo))

        return siguiente.sort((a, b) => a.nombre.localeCompare(b.nombre))
      })

      setMostrarForm(false)
      setEditando(null)
      setAviso({
        tipo: 'success',
        texto: esNuevo
          ? 'Tipo de bloqueo creado correctamente.'
          : 'Tipo de bloqueo actualizado correctamente.',
      })
    } catch (e) {
      setAviso({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo guardar el tipo de bloqueo.',
      })
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async () => {
    if (!accessToken || !confirmarEstado || procesando) return

    const actual = confirmarEstado
    setProcesando(true)
    setAviso(null)

    try {
      const actualizado = await blockTypesApi.cambiarEstado(
        accessToken,
        actual.id,
        !actual.activo,
      )

      setTipos(lista => lista.map(tipo => (tipo.id === actualizado.id ? actualizado : tipo)))
      setConfirmarEstado(null)
      setAviso({
        tipo: 'success',
        texto: actualizado.activo
          ? 'Tipo de bloqueo activado correctamente.'
          : 'Tipo de bloqueo desactivado correctamente.',
      })
    } catch (e) {
      setConfirmarEstado(null)
      setAviso({
        tipo: 'error',
        texto: e instanceof Error ? e.message : 'No se pudo cambiar el estado.',
      })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <>
      <PageHead
        title="Tipos de bloqueo"
        description="Administra los tipos de excepción disponibles para feriados, vacaciones, permisos, capacitaciones y cierres."
        actions={
          <Button icon="plus" onClick={abrirNuevo} disabled={loading}>
            Nuevo tipo
          </Button>
        }
      />

      <Toast aviso={aviso} onClose={() => setAviso(null)} />

      <AnimatePresence>
        {mostrarForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <Card className="border-brand/30 p-5 shadow-md sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">
                    {editando === null ? 'Crear tipo de bloqueo' : 'Editar tipo de bloqueo'}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Las reglas determinan qué campos aparecerán al registrar una excepción de agenda.
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

              <form onSubmit={event => void guardar(event)} className="grid gap-4 lg:grid-cols-2">
                <label className="min-w-0">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Código</span>
                  <input
                    value={form.codigo}
                    onChange={event => setForm(actual => ({ ...actual, codigo: event.target.value }))}
                    onBlur={() => setForm(actual => ({ ...actual, codigo: normalizarCodigo(actual.codigo) }))}
                    maxLength={30}
                    disabled={guardando}
                    placeholder="Ej. LICENCIA_MEDICA"
                    className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>

                <label className="min-w-0">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Nombre</span>
                  <input
                    value={form.nombre}
                    onChange={event => setForm(actual => ({ ...actual, nombre: event.target.value }))}
                    maxLength={80}
                    disabled={guardando}
                    placeholder="Ej. Licencia médica"
                    className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>

                <label className="min-w-0 lg:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-ink">Descripción</span>
                  <textarea
                    value={form.descripcion}
                    onChange={event => setForm(actual => ({ ...actual, descripcion: event.target.value }))}
                    rows={3}
                    maxLength={255}
                    disabled={guardando}
                    placeholder="Describe cuándo debe usarse este tipo de bloqueo."
                    className="w-full resize-none rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>

                <div className="rounded-2xl border border-line bg-alt/40 p-4">
                  <p className="mb-3 text-sm font-bold text-ink">Reglas para odontólogo</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={form.permiteOdontologo}
                      onChange={event =>
                        setForm(actual => ({
                          ...actual,
                          permiteOdontologo: event.target.checked,
                          requiereOdontologo: event.target.checked
                            ? actual.requiereOdontologo
                            : false,
                        }))
                      }
                      label="Permitir seleccionar odontólogo"
                      disabled={guardando}
                    />
                    <Checkbox
                      checked={form.requiereOdontologo}
                      onChange={event =>
                        setForm(actual => ({
                          ...actual,
                          requiereOdontologo: event.target.checked,
                          permiteOdontologo: event.target.checked
                            ? true
                            : actual.permiteOdontologo,
                        }))
                      }
                      label="Odontólogo obligatorio"
                      disabled={guardando}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-alt/40 p-4">
                  <p className="mb-3 text-sm font-bold text-ink">Reglas para sede</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={form.permiteSede}
                      onChange={event =>
                        setForm(actual => ({
                          ...actual,
                          permiteSede: event.target.checked,
                          requiereSede: event.target.checked ? actual.requiereSede : false,
                        }))
                      }
                      label="Permitir seleccionar sede"
                      disabled={guardando}
                    />
                    <Checkbox
                      checked={form.requiereSede}
                      onChange={event =>
                        setForm(actual => ({
                          ...actual,
                          requiereSede: event.target.checked,
                          permiteSede: event.target.checked ? true : actual.permiteSede,
                        }))
                      }
                      label="Sede obligatoria"
                      disabled={guardando}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5 lg:col-span-2">
                  <Button variant="ghost" onClick={cerrarForm} disabled={guardando}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={guardando}>
                    {guardando
                      ? 'Guardando…'
                      : editando === null
                        ? 'Crear tipo'
                        : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
          <div>
            <h2 className="text-base font-bold text-ink sm:text-lg">Catálogo de tipos</h2>
            <p className="mt-1 text-xs text-muted">
              {activos} activo{activos === 1 ? '' : 's'} de {tipos.length} registrado{tipos.length === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-muted">
            <Icon name="spinner" size={22} className="animate-spin text-brand" />
            Cargando tipos de bloqueo…
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p role="alert" className="text-sm text-danger">{error}</p>
            <Button variant="ghost" className="mt-4" onClick={() => setRefresh(n => n + 1)}>
              Reintentar
            </Button>
          </div>
        ) : tipos.length === 0 ? (
          <div className="p-10 text-center">
            <Icon name="calendarEdit" size={36} className="mx-auto text-muted" />
            <p className="mt-3 font-semibold text-ink">No hay tipos de bloqueo registrados.</p>
          </div>
        ) : (
          <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-2">
            {tipos.map(tipo => (
              <article key={tipo.id} className="rounded-2xl border border-line bg-surface p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-ink">{tipo.nombre}</h3>
                      <Badge tone={tipo.activo ? 'green' : 'gray'}>
                        {tipo.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-[11px] font-semibold text-muted">{tipo.codigo}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="edit"
                      onClick={() => abrirEditar(tipo)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={tipo.activo ? 'outline' : 'primary'}
                      className={tipo.activo ? 'text-danger hover:border-danger/40 hover:text-danger' : undefined}
                      onClick={() => setConfirmarEstado(tipo)}
                    >
                      {tipo.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>

                {tipo.descripcion && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{tipo.descripcion}</p>
                )}

                <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                  <div className="rounded-xl bg-alt/60 p-3">
                    <p className="font-bold text-ink">Odontólogo</p>
                    <p className="mt-1 text-muted">
                      {!tipo.permiteOdontologo
                        ? 'No permitido'
                        : tipo.requiereOdontologo
                          ? 'Obligatorio'
                          : 'Opcional'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-alt/60 p-3">
                    <p className="font-bold text-ink">Sede</p>
                    <p className="mt-1 text-muted">
                      {!tipo.permiteSede
                        ? 'No permitida'
                        : tipo.requiereSede
                          ? 'Obligatoria'
                          : 'Opcional'}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmarEstado !== null}
        title={confirmarEstado?.activo ? '¿Desactivar tipo de bloqueo?' : '¿Activar tipo de bloqueo?'}
        description={
          confirmarEstado?.activo
            ? 'El tipo dejará de aparecer para nuevos bloqueos, pero los registros históricos conservarán su referencia.'
            : 'El tipo volverá a estar disponible para registrar nuevas excepciones de agenda.'
        }
        confirmLabel={procesando
          ? 'Procesando…'
          : confirmarEstado?.activo
            ? 'Desactivar'
            : 'Activar'}
        cancelLabel="Cancelar"
        onCancel={() => {
          if (!procesando) setConfirmarEstado(null)
        }}
        onConfirm={() => void cambiarEstado()}
      />
    </>
  )
}
