import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Id } from '@/lib/id'
import { fullName } from '@/lib/people'
import { MOCK_APPOINTMENTS } from '@/features/appointments/mock'
import { MOCK_PATIENTS } from '@/features/patients/mock'
import { MOCK_USERS } from '@/features/users/mock'
import { DataContext, type DataStore } from './context'
import type { Appointment, NewAppointment, PaymentInput } from '@/features/appointments/types'
import type { Patient } from '@/features/patients/types'
import type { User } from '@/features/users/types'

/** Siguiente id libre de una colección mock. Lo asignará el backend. */
const nextId = (items: readonly { id: Id }[]) =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1

/**
 * Estado compartido de la aplicación. Hoy resuelve contra los mocks en memoria:
 * es el único punto que hay que cambiar para conectar el backend, sustituyendo
 * cada operación por una llamada a la API.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [patients] = useState<Patient[]>(MOCK_PATIENTS)
  const [users, setUsers] = useState<User[]>(MOCK_USERS)

  const appointmentById = useCallback((id: Id) => appointments.find((a) => a.id === id), [appointments])
  const patientById = useCallback((id: Id) => patients.find((p) => p.id === id), [patients])
  const userById = useCallback((id: Id) => users.find((u) => u.id === id), [users])

  const pacName = useCallback((id: Id) => {
    const p = patients.find((x) => x.id === id)
    return p ? fullName(p) : '—'
  }, [patients])

  const docName = useCallback((id: Id) => {
    const u = users.find((x) => x.id === id)
    return u ? fullName(u) : '—'
  }, [users])

  const docEsp = useCallback((id: Id) => users.find((x) => x.id === id)?.esp ?? '', [users])

  /**
   * Alta de una cita reservada desde el área del paciente. Nace programada y
   * con el pago pendiente, que es como llega al centro. Con la API conectada,
   * el id y el estado los devolverá el backend.
   */
  const createAppointment = useCallback((input: NewAppointment) => {
    const cita: Appointment = {
      ...input,
      id: nextId(appointments),
      estado: 'Programada',
      pago: 'Pendiente',
      tipoPago: null,
      codigoTransaccion: '',
    }
    setAppointments((list) => [...list, cita])
    return cita
  }, [appointments])

  const cancelAppointment = useCallback((id: Id) => {
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, estado: 'Cancelada', pago: 'No realizado' } : a)),
    )
  }, [])

  const deleteUser = useCallback((id: Id) => {
    setUsers((list) => list.filter((u) => u.id !== id))
  }, [])

  const savePayment = useCallback((id: Id, input: PaymentInput) => {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, ...input } : a)))
  }, [])

  const value = useMemo<DataStore>(
    () => ({
      appointments, patients, users,
      appointmentById, patientById, userById,
      pacName, docName, docEsp,
      createAppointment, cancelAppointment, savePayment, deleteUser,
    }),
    [appointments, patients, users, appointmentById, patientById, userById, pacName, docName, docEsp, createAppointment, cancelAppointment, savePayment, deleteUser],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
