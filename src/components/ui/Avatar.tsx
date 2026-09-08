import { avatarColor, initials } from '@/lib/people'

interface AvatarProps {
  nombre: string
  apellido: string
  /** Semilla del color; el mismo número da siempre el mismo tono. */
  seed: number
  size?: number
}

/** Círculo con las iniciales de la persona. */
export function Avatar({ nombre, apellido, seed, size = 60 }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, background: avatarColor(seed), fontSize: size * 0.34 }}
      className="inline-grid flex-none place-items-center rounded-full font-bold text-white"
    >
      {initials(nombre, apellido)}
    </span>
  )
}
