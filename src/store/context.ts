import { createContext } from 'react'
import type { Id } from '@/lib/id'
import type { Appointment, NewAppointment, PaymentInput } from '@/features/appointments/types'
import type { Patient } from '@/features/patients/types'
import type { User } from '@/features/users/types'

/** Contrato del estado compartido: lecturas, búsquedas y operaciones. */
export interface DataStore {
  appointments: Appointment[]
  patients: Patient[]
  users: User[]
  appointmentById: (id: Id) => Appointment | undefined
  patientById: (id: Id) => Patient | undefined
  userById: (id: Id) => User | undefined
  pacName: (id: Id) => string
  docName: (id: Id) => string
  docEsp: (id: Id) => string
  /** Registra la cita reservada por el paciente y devuelve la que quedó creada. */
  createAppointment: (input: NewAppointment) => Appointment
  cancelAppointment: (id: Id) => void
  deleteUser: (id: Id) => void
  savePayment: (id: Id, input: PaymentInput) => void
}

export const DataContext = createContext<DataStore | null>(null)
