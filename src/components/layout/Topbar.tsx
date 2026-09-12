import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks'
import { avatarSeed, fullName } from '@/lib/people'
import { Avatar, Icon } from '@/components/ui'

export function Topbar() {
  const { user: me } = useAuth()

  return (
    <header className="flex h-topbar flex-none items-center justify-end gap-4 border-b border-line bg-surface px-6 print:hidden">
      <button
        type="button"
        aria-label="Notificaciones"
        className="relative grid size-[42px] cursor-pointer place-items-center rounded-full border border-line bg-alt text-ink-soft hover:text-ink"
      >
        <Icon name="bell" size={20} />
        <span className="absolute top-2 right-2.5 size-[7px] rounded-full bg-danger" />
      </button>

      {me && (
        <Link
          to="/perfil"
          className="flex items-center gap-2.5 rounded-full p-1 transition hover:bg-hover"
          title="Ver mi perfil"
        >
          <Avatar
            nombre={me.nombre}
            apellido={me.apellido}
            seed={avatarSeed(me.id)}
            size={45}
            animate="always"
          />

          <div className="pr-2 max-md:hidden">
            <div className="text-[0.9rem] leading-tight font-bold text-ink">{fullName(me)}</div>
            <div className="text-[0.78rem] text-muted">{me.rol}</div>
          </div>
        </Link>
      )}
    </header>
  )
}
