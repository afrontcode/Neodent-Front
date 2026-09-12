import { NavLink, useNavigate } from 'react-router-dom'
import { navItemsFor } from '@/config/navigation'
import { useAuth } from '@/features/auth/hooks'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'

const itemBase =
  'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[0.9rem] font-bold tracking-wide transition'

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = user ? navItemsFor(user.rol) : []

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-sidebar flex-none flex-col gap-1 overflow-y-auto border-r border-line bg-surface px-3.5 py-6 max-md:hidden print:hidden">
      <div className="mb-7 text-center">
        <small className="text-[0.78rem] text-muted">Centro odontológico</small>
        <h1 className="mt-0.5 text-2xl font-bold text-brand">NeoDents</h1>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(itemBase, isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-hover hover:text-ink')
            }
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className={cn(itemBase, 'mt-auto cursor-pointer text-muted hover:bg-hover hover:text-ink')}
      >
        <Icon name="logout" size={20} />
        CERRAR SESIÓN
      </button>
    </aside>
  )
}
