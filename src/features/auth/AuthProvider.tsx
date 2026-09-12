import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { parseId } from '@/lib/id'
import { MIN_PASSWORD } from '@/lib/validation'
import { MOCK_USERS } from '@/features/users/mock'
import type { User } from '@/features/users/types'
import { AuthContext, type AuthStore } from './context'
import type { Credentials, RegisterInput } from './types'

const STORAGE_KEY = 'neodents.session'
const FAKE_LATENCY_MS = 600

/** Recupera la sesión guardada, si la hay. Tolera almacenamiento bloqueado. */
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const id = parseId(raw)
    return MOCK_USERS.find((u) => u.id === id) ?? null
  } catch {
    return null
  }
}

function persist(user: User, remember: boolean) {
  try {
    const target = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    target.setItem(STORAGE_KEY, String(user.id))
    other.removeItem(STORAGE_KEY)
  } catch {
    /* sin almacenamiento: la sesión vive sólo en memoria */
  }
}

function clearPersisted() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nada que limpiar */
  }
}

/**
 * Sesión de la aplicación. Hoy valida contra los usuarios de ejemplo (cualquier
 * correo registrado con una contraseña de al menos 6 caracteres). Es el único
 * punto que hay que cambiar para conectar el backend: sustituir `login` por la
 * llamada a la API y guardar el token en lugar del id.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)

  const login = useCallback(async ({ correo, password, recordarme }: Credentials) => {
    await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))

    const email = correo.trim().toLowerCase()
    const found = MOCK_USERS.find((u) => u.correo.toLowerCase() === email)
    if (!found || password.length < MIN_PASSWORD) {
      throw new Error('Correo o contraseña incorrectos.')
    }
    if (!found.activo) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.')
    }

    persist(found, recordarme)
    setUser(found)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))

    const email = input.correo.trim().toLowerCase()
    if (MOCK_USERS.some((u) => u.correo.toLowerCase() === email)) {
      throw new Error('Ya existe una cuenta registrada con este correo.')
    }
    // Mock: todavía no hay backend, así que el registro no se persiste.
    // Sustituir por la llamada a la API que crea la cuenta.
  }, [])

  const logout = useCallback(() => {
    clearPersisted()
    setUser(null)
  }, [])

  const value = useMemo<AuthStore>(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
