import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, BackLink, Badge, Button, Card, Icon, InfoRow, StatusDot,} from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { statusTone } from '@/features/appointments/utils'
import { roleTone } from '@/features/users/utils'
import { isoToDMY } from '@/lib/format'
import { parseId } from '@/lib/id'
import { fullName } from '@/lib/people'
import { useData } from '@/store/hooks'

interface UserDetailPageProps {
  isCurrentProfile?: boolean
}

export function UserDetailPage({ isCurrentProfile = false }: UserDetailPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { userById, appointments, pacName } = useData()

  const targetId = isCurrentProfile
    ? (authUser?.id ?? 1)
    : id
      ? parseId(id)
      : (authUser?.id ?? 1)
  const user = userById(targetId)

  if (!user) {
    return (
      <>
        <BackLink to="/usuarios">Volver a Usuarios</BackLink>
        <Card className="grid place-items-center gap-3 px-6 py-20 text-center text-muted">
          <Icon name="warning" size={28} />
          <p className="text-[0.95rem]">El usuario no existe o no se encuentra disponible.</p>
        </Card>
      </>
    )
  }

  const userAppointments = appointments.filter((a) => a.docId === user.id)
  const isDoctor = user.rol === 'Odontólogo'

  return (
    <div className="space-y-6">
      {!isCurrentProfile && <BackLink to="/usuarios">Volver a Usuarios</BackLink>}

      {/* Hero Header Card con Avatar Gigante Interactivo */}
      <Card className="overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative">
            <Avatar
              nombre={user.nombre}
              apellido={user.apellido}
              //seed={avatarSeed(user.id)}
              size={110}
              animate="always"
              trackCursor={true}
              className="ring-4 ring-brand-soft shadow-md"
            />
            <span
              title={user.activo ? 'Usuario Activo' : 'Usuario Inactivo'}
              className={`absolute bottom-1 right-1 size-5 rounded-full border-2 border-surface ${
                user.activo ? 'bg-success' : 'bg-danger'
              }`}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {fullName(user)}
              </h1>
              <Badge tone={roleTone[user.rol]}>{user.rol}</Badge>
            </div>

            <p className="mt-1 text-base text-ink-soft">
              {user.esp} • <span className="text-muted">{user.correo}</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm sm:justify-start">
              <StatusDot on={user.activo}>
                {user.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
              </StatusDot>
              {isDoctor && (
                <span className="flex items-center gap-1.5 text-muted">
                  <Icon name="calendar" size={16} />
                  {user.tieneHorario ? 'Horario configurado' : 'Sin horario registrado'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="ghost"
              icon="edit"
              onClick={() => navigate(`/usuarios/${user.id}/editar`)}
            >
              Editar datos
            </Button>
          </div>
        </div>

        {/* Métricas rápidas */}
        {isDoctor && (
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3">
            <div className="rounded-xl bg-alt p-4 text-center">
              <div className="text-2xl font-bold text-brand">{userAppointments.length}</div>
              <div className="text-xs text-muted">Citas asignadas</div>
            </div>
            <div className="rounded-xl bg-alt p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {userAppointments.filter((a) => a.estado === 'Atendida').length}
              </div>
              <div className="text-xs text-muted">Citas atendidas</div>
            </div>
            <div className="col-span-2 rounded-xl bg-alt p-4 text-center sm:col-span-1">
              <div className="text-2xl font-bold text-ink">
                {user.tieneHorario ? 'Disponible' : 'No disp.'}
              </div>
              <div className="text-xs text-muted">Estado de agenda</div>
            </div>
          </div>
        )}
      </Card>

      {/* Grid de detalles y contenido */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Columna Izquierda: Información Detallada */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
              <Icon name="usuarios" size={20} className="text-brand" />
              Información de la cuenta
            </h2>
            <InfoRow label="Nombre completo" value={fullName(user)} />
            <InfoRow label="Correo institucional" value={user.correo} />
            <InfoRow label="Rol en el sistema" value={<Badge tone={roleTone[user.rol]}>{user.rol}</Badge>} />
            <InfoRow label="Especialidad médica" value={user.esp || 'No aplica'} />
            <InfoRow label="Identificador (ID)" value={`#${user.id}`} />
            <InfoRow
              label="Disponibilidad de atención"
              value={user.tieneHorario ? 'Lunes a Viernes (8:00 - 18:00)' : 'Sin horario registrado'}
            />
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
              <Icon name="file" size={20} className="text-brand" />
              Seguridad y Sesión
            </h2>
            <InfoRow label="Estado del acceso" value={<StatusDot on={user.activo}>{user.activo ? 'Permitido' : 'Bloqueado'}</StatusDot>} />
            <InfoRow label="Método de acceso" value="Credenciales Neodent" />
            <InfoRow label="Última actividad" value="Hoy, 10:45 AM" />
          </Card>
        </div>

        {/* Columna Derecha: Citas Asociadas o Actividad */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                <Icon name="citas" size={20} className="text-brand" />
                {isDoctor ? 'Citas del especialista' : 'Actividad del usuario'}
              </h2>
              {isDoctor && userAppointments.length > 0 && (
                <span className="text-xs font-bold text-muted">
                  {userAppointments.length} total
                </span>
              )}
            </div>

            {userAppointments.length === 0 ? (
              <div className="grid place-items-center py-10 text-center text-muted">
                <Icon name="calendar" size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No hay citas registradas para este usuario.</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {userAppointments.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="flex cursor-pointer items-center justify-between py-3 transition hover:bg-hover"
                    onClick={() => navigate(`/citas/${a.id}`)}
                  >
                    <div>
                      <div className="font-bold text-ink">{pacName(a.pacId)}</div>
                      <div className="text-xs text-muted">
                        {isoToDMY(a.fecha)} • {a.hora} • {a.lugar}
                      </div>
                    </div>
                    <Badge tone={statusTone[a.estado]}>{a.estado}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
