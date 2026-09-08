import type { IconName } from '@/components/ui/Icon'

export interface NavItem {
  label: string
  icon: IconName
  href: string
}

/** Menú lateral. Añadir o quitar entradas aquí para cambiar la navegación. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'USUARIOS', icon: 'usuarios', href: '/usuarios' },
  { label: 'CITAS', icon: 'citas', href: '/citas' },
  { label: 'PACIENTES', icon: 'pacientes', href: '/pacientes' },
]
