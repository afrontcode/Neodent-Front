import type { IconName } from '@/components/ui/Icon'

export interface Service {
  id: string
  nombre: string
  /** Frase corta bajo el nombre, en la tarjeta del servicio. */
  detalle: string
  icon: IconName
}

/** Servicios que el paciente puede reservar. Sustituir por el catálogo del backend. */
export const SERVICES: readonly Service[] = [
  { id: 'profilaxis', nombre: 'Profilaxis', detalle: 'Limpieza dental', icon: 'braces' },
  { id: 'extraccion', nombre: 'Extracción', detalle: 'Extracción dental', icon: 'forceps' },
  { id: 'curacion', nombre: 'Curación', detalle: 'Curación dental', icon: 'toothCracked' },
  { id: 'otras', nombre: 'Otras consultas', detalle: 'Evaluamos tu caso', icon: 'tooth' },
]

export interface Branch {
  nombre: string
  direccion: string
}

/** Sedes que atienden citas, con la dirección que se muestra al elegirlas. */
export const BRANCHES: readonly Branch[] = [
  { nombre: 'Jesús María', direccion: 'Av. el consultorio dental, Jesús María' },
  { nombre: 'San Borja', direccion: 'Av. el consultorio dental, San Borja' },
  { nombre: 'Lince', direccion: 'Av. el consultorio dental, Lince' },
]

/** Datos que reúne el primer paso de la reserva. */
export interface AppointmentDraft {
  servicio: string
  sede: string
}
