import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Badge, Button, Card, ConfirmDialog, Field, Input, PageHead, SearchInput, Table, TableState, Toast, type Column } from '@/shared/components/ui'
import { useAuth } from '@/features/auth'
import { ApiError } from '@/shared/api/apiClient'
import { rolesApi, type RolResponse } from '../api/rolesApi'

const COLUMNS: Column[] = [
  { label: 'Rol' },
  { label: 'Descripción' },
  { label: 'Tipo' },
  { label: 'Estado' },
  { label: 'Acciones', align: 'right' },
]

type Aviso = { tipo: 'success' | 'error'; texto: string }

export function RolesPage() {
  const { accessToken } = useAuth()
  const [roles, setRoles] = useState<RolResponse[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [editando, setEditando] = useState<RolResponse | null>(null)
  const [confirmar, setConfirmar] = useState<RolResponse | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [actualizacion, setActualizacion] = useState(0)

  useEffect(() => {
    if (!accessToken) return

    let activo = true
    setLoading(true)
    setError('')

    rolesApi.listar(accessToken)
      .then(data => {
        if (activo) setRoles(data)
      })
      .catch(e => {
        if (activo) setError(
          e instanceof Error ? e.message : 'No se pudieron cargar los roles.',
        )
      })
      .finally(() => {
        if (activo) setLoading(false)
      })

    return () => {
      activo = false
    }
  }, [accessToken, actualizacion])

  useEffect(() => {
    if (!aviso) return

    const timer = window.setTimeout(
      () => setAviso(null),
      aviso.tipo === 'error' ? 7000 : 4000,
    )

    return () => window.clearTimeout(timer)
  }, [aviso])

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return roles

    return roles.filter(r =>
      `${r.nombre} ${r.descripcion ?? ''}`
        .toLowerCase()
        .includes(q),
    )
  }, [roles, query])

  const abrirNuevo = () => {
    setEditando(null)
    setNombre('')
    setDescripcion('')
    setError('')
    setMostrarForm(true)
  }

  const abrirEditar = (rol: RolResponse) => {
    setEditando(rol)
    setNombre(rol.nombre)
    setDescripcion(rol.descripcion ?? '')
    setError('')
    setMostrarForm(true)
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()

    if (!accessToken || guardando) return

    if (!nombre.trim()) {
      setError('Ingresa el nombre del rol.')
      return
    }

    setGuardando(true)
    setError('')

    try {
      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
      }

      if (editando) {
        await rolesApi.actualizar(accessToken, editando.id, data)
      } else {
        await rolesApi.crear(accessToken, data)
      }

      setMostrarForm(false)
      setAviso({
        tipo: 'success',
        texto: editando
          ? 'Rol actualizado correctamente.'
          : 'Rol creado correctamente.',
      })
      setActualizacion(n => n + 1)
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'No se pudo guardar el rol.',
      )
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async () => {
    if (!accessToken || !confirmar) return

    const activar = !confirmar.activo

    try {
      if (activar) {
        await rolesApi.activar(accessToken, confirmar.id)
      } else {
        await rolesApi.desactivar(accessToken, confirmar.id)
      }

      setAviso({
        tipo: 'success',
        texto: activar
          ? 'Rol activado correctamente.'
          : 'Rol desactivado correctamente.',
      })

      setConfirmar(null)
      setActualizacion(n => n + 1)
    } catch (e) {
      setAviso({
        tipo: 'error',
        texto: e instanceof Error
          ? e.message
          : 'No se pudo cambiar el estado del rol.',
      })

      setConfirmar(null)
    }
  }

  return (
    <>
      <PageHead
        title="Roles"
        description="Administra el catálogo de roles del sistema."
        actions={
          <Button icon="plus" onClick={abrirNuevo}>
            Nuevo rol
          </Button>
        }
      />

      <Toast aviso={aviso} onClose={() => setAviso(null)} />

      <AnimatePresence>
        {mostrarForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <Card className="p-5">
              <form
                onSubmit={guardar}
                className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end"
              >
                <Field label="Nombre del rol *">
                  <Input
                    value={nombre}
                    onChange={e =>
                      setNombre(
                        e.target.value
                          .toUpperCase()
                          .replace(/\s+/g, '_'),
                      )
                    }
                    disabled={guardando || Boolean(editando?.sistema)}
                    placeholder="Ej. SUPERVISOR"
                  />
                </Field>

                <Field label="Descripción">
                  <Input
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    disabled={guardando}
                    placeholder="Describe el alcance del rol"
                  />
                </Field>

                <div className="flex gap-2">
                  <Button type="submit" disabled={guardando}>
                    {guardando
                      ? 'Guardando…'
                      : editando
                        ? 'Actualizar'
                        : 'Crear'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setMostrarForm(false)}
                    disabled={guardando}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>

              {editando?.sistema && (
                <p className="mt-2 text-xs text-muted">
                  El nombre de un rol del sistema no puede cambiarse.
                </p>
              )}

              {error && (
                <p className="mt-3 text-sm text-danger">
                  {error}
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <div className="p-4">
          <SearchInput
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar rol…"
            className="w-full sm:max-w-md"
          />
        </div>

        <Table columns={COLUMNS}>
          <TableState
            colSpan={COLUMNS.length}
            loading={loading}
            error={error && !mostrarForm ? error : null}
            empty={!loading && !error && filtrados.length === 0}
            emptyLabel="No hay roles registrados."
          />

          {!loading && filtrados.map(rol => (
            <tr key={rol.id}>
              <td>
                <span className="font-bold text-ink">
                  {rol.nombre}
                </span>
              </td>

              <td className="max-w-md whitespace-normal text-ink-soft">
                {rol.descripcion || 'Sin descripción'}
              </td>

              <td>
                <Badge tone={rol.sistema ? 'blue' : 'gray'}>
                  {rol.sistema ? 'Sistema' : 'Personalizado'}
                </Badge>
              </td>

              <td>
                <Badge tone={rol.activo ? 'green' : 'gray'}>
                  {rol.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>

              <td className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => abrirEditar(rol)}
                  >
                    Editar
                  </Button>

                  {!rol.sistema && (
                    <Button
                      size="sm"
                      variant={rol.activo ? 'danger' : 'outline'}
                      onClick={() => setConfirmar(rol)}
                    >
                      {rol.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <ConfirmDialog
        open={confirmar !== null}
        title={confirmar?.activo ? '¿Desactivar rol?' : '¿Activar rol?'}
        description={
          confirmar
            ? `Se cambiará el estado del rol ${confirmar.nombre}.`
            : ''
        }
        confirmLabel={confirmar?.activo ? 'Desactivar' : 'Activar'}
        onConfirm={() => void cambiarEstado()}
        onCancel={() => setConfirmar(null)}
      />
    </>
  )
}