import { DOW, MONTHS } from './constants'

/** 2026-08-12 -> 12/08/2026 */
export const isoToDMY = (iso: string) => iso.split('-').reverse().join('/')

/** 2026-08-24 -> Lunes 24 de Agosto de 2026 */
export function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${DOW[dt.getDay()]} ${d} de ${MONTHS[m - 1]} de ${y}`
}

export const money = (n: number | null | undefined) =>
  n != null ? `S/ ${Number(n).toFixed(2)}` : '—'
