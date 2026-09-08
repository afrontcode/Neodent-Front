import { CURRENT_USER_ID } from '@/config/session'
import { MOCK_USERS } from '@/features/users/mock'
import { fullName } from '@/lib/people'
import { Icon } from '@/components/ui'

export function Topbar() {
  const me = MOCK_USERS.find((u) => u.id === CURRENT_USER_ID)

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
        <div className="flex items-center gap-2.5">
          <img
            src="https://i.pravatar.cc/80?img=12"
            alt=""
            className="size-10 rounded-full bg-line object-cover"
          />
          <div className="max-md:hidden">
            <div className="text-[0.9rem] leading-tight font-bold">{fullName(me)}</div>
            <div className="text-[0.78rem] text-muted">{me.rol}</div>
          </div>
        </div>
      )}
    </header>
  )
}
