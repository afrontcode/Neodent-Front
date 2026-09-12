import type { IconName } from '@/components/ui/Icon'
import type { Role } from '@/features/users/types'

export interface NavItem {
  label: string
  icon: IconName
  href: string
}

/** Menú del equipo del centro: administradores y odontólogos. */
const STAFF_NAV: NavItem[] = [
  { label: 'USUARIOS', icon: 'usuarios', href: '/usuarios' },
  { label: 'CITAS', icon: 'citas', href: '/citas' },
  { label: 'PACIENTES', icon: 'pacientes', href: '/pacientes' },
]

/** Menú del paciente: sólo su propia agenda. */
const PATIENT_NAV: NavItem[] = [{ label: 'MIS CITAS', icon: 'citas', href: '/mis-citas' }]

/**
 * Menú lateral según el rol. Añadir o quitar entradas aquí para cambiar la
 * navegación de cada tipo de cuenta.
 */
export const navItemsFor = (rol: Role): NavItem[] => (rol === 'Paciente' ? PATIENT_NAV : STAFF_NAV)

/** Pantalla de inicio de cada rol, a donde se entra tras iniciar sesión. */
export const homeFor = (rol: Role): string => (rol === 'Paciente' ? '/mis-citas' : '/citas')
