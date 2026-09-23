import type { IconName } from '@/components/ui/Icon'
import type { Role } from '@/features/users/types'

export interface NavItem {
  label: string
  icon: IconName
  href: string
}

const DASHBOARD: NavItem = {
  label: 'DASHBOARD',
  icon: 'calendar',
  href: '/dashboard',
}

const ADMIN_NAV: NavItem[] = [
  DASHBOARD,
  { label: 'USUARIOS', icon: 'usuarios', href: '/usuarios' },
  { label: 'CITAS', icon: 'citas', href: '/citas' },
  { label: 'PACIENTES', icon: 'pacientes', href: '/pacientes' },
]

const RECEPTION_NAV: NavItem[] = [
  DASHBOARD,
  { label: 'CITAS', icon: 'citas', href: '/citas' },
  { label: 'PACIENTES', icon: 'pacientes', href: '/pacientes' },
]

const DENTIST_NAV: NavItem[] = [
  DASHBOARD,
  { label: 'CITAS', icon: 'citas', href: '/citas' },
  { label: 'PACIENTES', icon: 'pacientes', href: '/pacientes' },
]

const PATIENT_NAV: NavItem[] = [
  DASHBOARD,
  { label: 'MIS CITAS', icon: 'citas', href: '/mis-citas' },
]

export const navItemsFor = (rol: Role): NavItem[] => {
  switch (rol) {
    case 'Administrador':
      return ADMIN_NAV
    case 'Recepcionista':
      return RECEPTION_NAV
    case 'Odontólogo':
      return DENTIST_NAV
    case 'Paciente':
      return PATIENT_NAV
  }
}

export const homeFor = (_rol: Role): string => '/dashboard'