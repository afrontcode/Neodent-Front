import { useContext } from 'react'
import { DataContext, type DataStore } from './context'

/** Acceso al estado compartido. Falla pronto si falta el proveedor. */
export function useData(): DataStore {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>')
  return ctx
}
