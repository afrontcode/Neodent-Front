import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  PageHead,
  Pagination,
  SearchInput,
  Select,
  TableFoot,
  Toolbar,
} from '@/components/ui'
import { fullName } from '@/lib/people'
import { useData } from '@/store/hooks'
import { UsersTable } from './components/UsersTable'
import { ROLES, type Role, type User } from './types'

/** Usuarios por página, según el diseño del listado. */
const PAGE_SIZE = 7

export function UsersPage() {
  const navigate = useNavigate()
  const { users, appointments, deleteUser } = useData()

  const [query, setQuery] = useState('')
  const [rol, setRol] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return users.filter((u) => {
      if (rol && u.rol !== rol) return false
      if (!q) return true
      return fullName(u).toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
    })
  }, [users, query, rol])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  /** Si un filtro deja menos páginas que la actual, retrocede a la última válida. */
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  /** Al cambiar un filtro se vuelve a la primera página. */
  const applyFilter = (fn: () => void) => {
    fn()
    setPage(1)
  }

  const handleDelete = (u: User) => {
    const citas = appointments.filter((a) => a.docId === u.id).length
    if (citas > 0) {
      window.alert(
        `${fullName(u)} tiene ${citas} cita${citas === 1 ? '' : 's'} asignada${citas === 1 ? '' : 's'}. ` +
          'Reasígnalas o desactiva al usuario en lugar de eliminarlo.',
      )
      return
    }
    if (window.confirm(`¿Eliminar a ${fullName(u)}? Esta acción no se puede deshacer.`)) {
      deleteUser(u.id)
    }
  }

  return (
    <>
      <PageHead
        title="Usuarios"
        description="Administra el acceso, la especialidad y la disponibilidad del equipo."
        actions={
          <Button icon="plus" onClick={() => navigate('/usuarios/nuevo')}>
            Nuevo usuario
          </Button>
        }
      />

      <Card>
        <Toolbar>
          <SearchInput
            placeholder="Buscar por nombre o correo…"
            value={query}
            onChange={(e) => applyFilter(() => setQuery(e.target.value))}
          />
          <Select
            aria-label="Filtrar por rol"
            placeholder="Todos los roles"
            options={ROLES}
            value={rol}
            onChange={(e) => applyFilter(() => setRol(e.target.value as Role | ''))}
            className="min-w-52"
          />
        </Toolbar>

        <UsersTable
          users={rows}
          onDetail={(u) => navigate(`/usuarios/${u.id}`)}
          onEdit={(u) => navigate(`/usuarios/${u.id}/editar`)}
          onDelete={handleDelete}
        />

        <TableFoot summary={`${rows.length} de ${filtered.length} usuarios`}>
          <Pagination page={current} totalPages={totalPages} onChange={setPage} />
        </TableFoot>
      </Card>
    </>
  )
}
