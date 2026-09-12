import {
  ActionsCell,
  Avatar,
  Badge,
  Icon,
  KebabMenu,
  StatusDot,
  Table,
  TableState,
  type Column,
} from '@/components/ui'
import { avatarSeed } from '@/lib/people'
import type { User } from '../types'
import { missingSchedule, roleTone } from '../utils'

const COLUMNS: Column[] = [
  { label: 'Nombre y apellido' },
  { label: 'Rol' },
  { label: 'Correo' },
  { label: 'Estado' },
  { label: 'Acciones', align: 'right' },
]

interface UsersTableProps {
  users: User[]
  onDetail: (u: User) => void
  onEdit: (u: User) => void
  onDelete: (u: User) => void
}

export function UsersTable({ users, onDetail, onEdit, onDelete }: UsersTableProps) {
  return (
    <Table columns={COLUMNS}>
      <TableState
        colSpan={COLUMNS.length}
        empty={users.length === 0}
        emptyLabel="No hay usuarios que coincidan con los filtros."
      />
      {users.map((u) => (
        <tr key={u.id}>
          <td>
            <div className="flex items-center gap-3">
              <Avatar nombre={u.nombre} apellido={u.apellido} seed={avatarSeed(u.id)} size={44} animate="always" trackCursor={false}/>
              <div>
                <div className="font-bold">
                  {u.nombre} {u.apellido}
                </div>
                <div className="text-[0.85rem] text-muted">{u.esp}</div>
              </div>
            </div>
          </td>
          <td>
            <Badge tone={roleTone[u.rol]}>{u.rol}</Badge>
          </td>
          <td className="text-ink-soft">{u.correo}</td>
          <td>
            <StatusDot on={u.activo}>{u.activo ? 'Activo' : 'Inactivo'}</StatusDot>
            {missingSchedule(u) && (
              <div className="mt-1.5">
                <Badge tone="amber">
                  <Icon name="warning" size={13} className="mr-1" />
                  Sin horario
                </Badge>
              </div>
            )}
          </td>
          <ActionsCell>
            <KebabMenu
              actions={[
                { label: 'Ver detalle', icon: 'eye', onClick: () => onDetail(u) },
                { label: 'Editar', icon: 'edit', onClick: () => onEdit(u) },
                { label: 'Eliminar', icon: 'trash', onClick: () => onDelete(u), danger: true, dividerBefore: true },
              ]}
            />
          </ActionsCell>
        </tr>
      ))}
    </Table>
  )
}
