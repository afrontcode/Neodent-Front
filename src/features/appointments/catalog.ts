import type { Step } from '@/components/ui/Stepper'
import type { IconName } from '@/components/ui/Icon'
import type { Id } from '@/lib/id'

/** Pasos de la reserva, compartidos por todas las pantallas del proceso. */
export const BOOKING_STEPS: readonly Step[] = [
  { label: 'PASO 1', title: 'Datos generales' },
  { label: 'PASO 2', title: 'Fecha y hora' },
  { label: 'PASO 3', title: 'Confirmar' },
]

export interface Service {
  id: string
  nombre: string
  /** Frase corta bajo el nombre, en la tarjeta del servicio. */
  detalle: string
  icon: IconName
  /** Tarifa en soles que se muestra al confirmar la cita. */
  precio: number
}

/** Servicios que el paciente puede reservar. Sustituir por el catálogo del backend. */
export const SERVICES: readonly Service[] = [
  { id: 'profilaxis', nombre: 'Profilaxis', detalle: 'Limpieza dental', icon: 'braces', precio: 80 },
  { id: 'extraccion', nombre: 'Extracción', detalle: 'Extracción dental', icon: 'forceps', precio: 150 },
  { id: 'curacion', nombre: 'Curación', detalle: 'Curación dental', icon: 'toothCracked', precio: 120 },
  { id: 'otras', nombre: 'Otras consultas', detalle: 'Evaluamos tu caso', icon: 'tooth', precio: 60 },
]

/** Servicio del catálogo por su id. */
export const serviceById = (id: string) => SERVICES.find((s) => s.id === id)

/** Sede del catálogo por su nombre, para recuperar la dirección. */
export const branchByName = (nombre: string) => BRANCHES.find((b) => b.nombre === nombre)

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

/** El segundo paso añade al borrador el especialista y el cupo elegido. */
export interface ScheduleDraft extends AppointmentDraft {
  docId: Id
  /** Fecha en ISO (yyyy-mm-dd). */
  fecha: string
  /** Hora en formato HH:mm. */
  hora: string
}
