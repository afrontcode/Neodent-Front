import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, PageHead, Pagination, SearchInput, Select, TableFoot, Toolbar } from '@/shared/components/ui'
import { usersApi, type PaginaResponse, type UsuarioInternoResponse } from '../api/usersApi'
import { ApiError } from '@/shared/api/apiClient'
import { useAuth } from '@/features/auth'
import { UsersTable } from '../components/UsersTable'
import { mapUsuarioInterno, ROLE_TO_BACKEND } from '../model/users.mappers'
import { STAFF_ROLES, type User } from '../model/users.types'

const PAGE_SIZE = 7

export function UsersPage() {
  const navigate = useNavigate()
  const { accessToken } = useAuth()

  const [query, setQuery] = useState('')
  const [rol, setRol] = useState('')
  const [page, setPage] = useState(1)

  const [resultado, setResultado] =
    useState<PaginaResponse<UsuarioInternoResponse> | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setLoading(false)
      return
    }

    let active = true

    const cargarUsuarios = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await usersApi.listar(accessToken, {
          buscar: query,
          rol: rol ? ROLE_TO_BACKEND[rol] : undefined,
          page: page - 1,
          size: PAGE_SIZE,
        })

        if (active) {
          setResultado(data)
        }
      } catch (err) {
        if (!active) return

        setResultado(null)

        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudo cargar el listado de usuarios.',
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void cargarUsuarios()

    return () => {
      active = false
    }
  }, [accessToken, query, rol, page])

  const rows: User[] =
    resultado?.contenido.map(mapUsuarioInterno) ?? []

  const totalPages = Math.max(
    1,
    resultado?.totalPaginas ?? 1,
  )

  const applyFilter = (callback: () => void) => {
    callback()
    setPage(1)
  }

  return (
    <>
      <PageHead
        title="Usuarios"
        description="Administra el acceso y los datos del equipo."
        actions={
          <Button
            icon="plus"
            onClick={() => navigate('/usuarios/nuevo')}
          >
            Nuevo usuario
          </Button>
        }
      />

      <Card>
        <Toolbar>
          <SearchInput
            placeholder="Buscar por nombre, documento o correo…"
            value={query}
            onChange={(event) =>
              applyFilter(() => setQuery(event.target.value))
            }
          />

          <Select
            aria-label="Filtrar por rol"
            placeholder="Todos los roles"
            options={STAFF_ROLES}
            value={rol}
            onChange={(event) =>
              applyFilter(() => setRol(event.target.value))
            }
            className="min-w-52"
          />
        </Toolbar>

        {loading ? (
          <div className="p-8 text-center text-muted">
            Cargando usuarios…
          </div>
        ) : error ? (
          <div role="alert" className="p-8 text-center">
            <p className="text-danger">{error}</p>

            <p className="mt-2 text-sm text-muted">
              Comprueba la conexión con el backend e inténtalo de nuevo.
            </p>
          </div>
        ) : (
          <>
            <UsersTable
              users={rows}
              onDetail={(user) =>
                navigate(`/usuarios/${user.id}`)
              }
              onEdit={(user) =>
                navigate(`/usuarios/${user.id}/editar`)
              }
              onDelete={() => {
                window.alert(
                  'La desactivación se conectará en el siguiente paso.',
                )
              }}
            />

            <TableFoot
              summary={`${rows.length} de ${
                resultado?.totalElementos ?? 0
              } usuarios`}
            >
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={setPage}
              />
            </TableFoot>
          </>
        )}
      </Card>
    </>
  )
}