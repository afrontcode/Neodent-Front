import { MOCK_USERS } from '@/features/users/mock'

/** Dígitos que tiene el código enviado al correo. */
export const CODE_LENGTH = 6

/**
 * Código en duro mientras no hay backend: cualquier envío "manda" siempre este
 * mismo código, así se pueden recorrer los flujos de registro e inicio de
 * sesión. Al conectar la API hay que borrarlo y validar contra el endpoint.
 */
export const TEST_CODE = '123456'

/** Segundos de espera antes de poder pedir un código nuevo. */
export const RESEND_SECONDS = 30

const FAKE_LATENCY_MS = 600

/** Deja el correo en la forma con la que se compara y se guarda. */
export const normalizeEmail = (correo: string) => correo.trim().toLowerCase()

/**
 * Correos con el buzón ya confirmado. Vive en memoria: al recargar vuelve al
 * estado de los datos de ejemplo, de modo que el flujo se puede repetir. Con el
 * backend conectado esto lo responde el propio usuario autenticado.
 */
const verified = new Set(
  MOCK_USERS.filter((u) => u.correoVerificado).map((u) => normalizeEmail(u.correo)),
)

export const isVerified = (correo: string) => verified.has(normalizeEmail(correo))

export const markVerified = (correo: string) => {
  verified.add(normalizeEmail(correo))
}

/** Envía el código al correo. Hoy sólo lo deja en la consola. */
export async function sendCode(correo: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))
  console.info(`[mock] Código de verificación para ${normalizeEmail(correo)}: ${TEST_CODE}`)
}

/** Comprueba el código. Rechaza con un mensaje legible si no coincide. */
export async function checkCode(code: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))
  if (code.trim() !== TEST_CODE) {
    throw new Error('El código no es correcto. Revísalo o pide uno nuevo.')
  }
}

/** Oculta el correo para mostrarlo sin exponerlo entero: ro••••••@gmail.com */
export function maskEmail(correo: string): string {
  const [usuario = '', dominio = ''] = normalizeEmail(correo).split('@')
  if (!dominio) return correo
  const visible = usuario.slice(0, 2)
  return `${visible}${'•'.repeat(Math.max(usuario.length - visible.length, 3))}@${dominio}`
}
