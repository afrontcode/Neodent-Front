import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { parseId } from '@/lib/id'
import { MIN_PASSWORD } from '@/lib/validation'
import { MOCK_USERS } from '@/features/users/mock'
import type { User } from '@/features/users/types'
import { AuthContext, type AuthStore } from './context'
import { checkCode, isVerified, markVerified, normalizeEmail, sendCode } from './verification'
import type { Credentials, LoginOutcome, PendingVerification, RegisterInput } from './types'

const STORAGE_KEY = 'neodents.session'
const PENDING_KEY = 'neodents.verificacion'
const FAKE_LATENCY_MS = 600

/** Recupera la sesión guardada, si la hay. Tolera almacenamiento bloqueado. */
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const id = parseId(raw)
    const found = MOCK_USERS.find((u) => u.id === id) ?? null
    // Sólo se guarda la sesión de quien ya verificó su correo: al restaurarla
    // se recuerda, porque la marca de verificados vive en memoria.
    if (found) markVerified(found.correo)
    return found
  } catch {
    return null
  }
}

/** Recupera la verificación en curso para que sobreviva a un refresco. */
function readStoredPending(): PendingVerification | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingVerification) : null
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

function persistPending(pending: PendingVerification | null) {
  try {
    if (pending) sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    else sessionStorage.removeItem(PENDING_KEY)
  } catch {
    /* sin almacenamiento: la verificación vive sólo en memoria */
  }
}

function clearPersisted() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    /* nada que limpiar */
  }
}

/**
 * Sesión de la aplicación. Hoy valida contra los usuarios de ejemplo (cualquier
 * correo registrado con una contraseña de al menos 6 caracteres) y contra el
 * código de prueba de `verification.ts`. Es el único punto que hay que cambiar
 * para conectar el backend: sustituir `login`, `register`, `verify` y `resend`
 * por las llamadas a la API y guardar el token en lugar del id.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [pending, setPendingState] = useState<PendingVerification | null>(readStoredPending)

  const setPending = useCallback((next: PendingVerification | null) => {
    persistPending(next)
    setPendingState(next)
  }, [])

  const login = useCallback(
    async ({ correo, password, recordarme }: Credentials): Promise<LoginOutcome> => {
      await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))

      const email = normalizeEmail(correo)
      const found = MOCK_USERS.find((u) => u.correo.toLowerCase() === email)
      if (!found || password.length < MIN_PASSWORD) {
        throw new Error('Correo o contraseña incorrectos.')
      }
      if (!found.activo) {
        throw new Error('Tu cuenta está desactivada. Contacta al administrador.')
      }

      // Cuenta sin confirmar: se manda un código nuevo y se pide verificarla
      // antes de abrir la sesión.
      if (!isVerified(email)) {
        await sendCode(email)
        setPending({ correo: email, motivo: 'login', recordarme })
        return 'verificar'
      }

      persist(found, recordarme)
      setUser(found)
      return 'ok'
    },
    [setPending],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))

      const email = normalizeEmail(input.correo)
      if (MOCK_USERS.some((u) => u.correo.toLowerCase() === email)) {
        throw new Error('Ya existe una cuenta registrada con este correo.')
      }
      // Mock: todavía no hay backend, así que el registro no se persiste.
      // Sustituir por la llamada a la API que crea la cuenta.
      await sendCode(email)
      setPending({ correo: email, motivo: 'registro', recordarme: false })
    },
    [setPending],
  )

  const verify = useCallback(
    async (code: string) => {
      if (!pending) throw new Error('No hay ninguna verificación en curso.')

      await checkCode(code)
      markVerified(pending.correo)

      // Al verificar desde el login se entra directo; desde el registro la
      // cuenta aún no existe en los datos de ejemplo, así que se vuelve al login.
      if (pending.motivo === 'login') {
        const found = MOCK_USERS.find((u) => u.correo.toLowerCase() === pending.correo)
        if (found) {
          persist(found, pending.recordarme)
          setUser(found)
        }
      }
      setPending(null)
    },
    [pending, setPending],
  )

  const resend = useCallback(async () => {
    if (!pending) throw new Error('No hay ninguna verificación en curso.')
    await sendCode(pending.correo)
  }, [pending])

  const cancelVerification = useCallback(() => setPending(null), [setPending])

  const logout = useCallback(() => {
    clearPersisted()
    setPendingState(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthStore>(
    () => ({ user, pending, login, register, verify, resend, cancelVerification, logout }),
    [user, pending, login, register, verify, resend, cancelVerification, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
