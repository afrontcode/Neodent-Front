import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'

/** Deja sólo los dígitos de lo que se escriba o se pegue. */
const onlyDigits = (raw: string) => raw.replace(/\D/g, '')

interface CodeInputProps {
  /** Código escrito hasta ahora; puede ser más corto que `length`. */
  value: string
  onChange: (code: string) => void
  /** Se dispara al completar el último dígito (también al pegar el código). */
  onComplete?: (code: string) => void
  length: number
  disabled?: boolean
  invalid?: boolean
  /** Nombre del grupo para los lectores de pantalla. */
  label: string
  /** Id del mensaje de ayuda o de error asociado. */
  describedBy?: string
}

/**
 * Casillas para un código de un solo uso: una por dígito, con avance y
 * retroceso automáticos, flechas y pegado del código completo.
 */
export function CodeInput({
  value,
  onChange,
  onComplete,
  length,
  disabled,
  invalid,
  label,
  describedBy,
}: CodeInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  // Al entrar, y cuando el código se limpia tras un error, se empieza de nuevo
  // por la primera casilla.
  useEffect(() => {
    if (!value) boxes.current[0]?.focus()
  }, [value])

  const focusBox = (index: number) => {
    const box = boxes.current[Math.min(Math.max(index, 0), length - 1)]
    box?.focus()
    box?.select()
  }

  const emit = (code: string, focusAt: number) => {
    onChange(code)
    focusBox(focusAt)
    if (code.length === length) onComplete?.(code)
  }

  /** Escribe uno o varios dígitos a partir de `index`. */
  const write = (index: number, raw: string) => {
    const typed = onlyDigits(raw)
    if (!typed) return
    const next = [...digits]
    for (let i = 0; i < typed.length && index + i < length; i += 1) {
      next[index + i] = typed[i]
    }
    emit(next.join(''), index + typed.length)
  }

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      // Con la casilla vacía, el borrado se lleva el dígito anterior.
      const target = digits[index] ? index : index - 1
      if (target < 0) return
      const next = [...digits]
      next[target] = ''
      emit(next.join(''), target)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    write(index, event.clipboardData.getData('text'))
  }

  return (
    <div
      role="group"
      aria-label={label}
      aria-describedby={describedBy}
      className="flex justify-center gap-2.5 max-sm:gap-2"
    >
      {digits.map((digit, index) => (
        <input
          // Las casillas son posiciones fijas, no una lista que se reordene.
          key={index}
          ref={(el) => {
            boxes.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Dígito ${index + 1} de ${length}`}
          aria-invalid={invalid || undefined}
          maxLength={length}
          disabled={disabled}
          value={digit}
          onChange={(e) => write(index, e.target.value)}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste(index)}
          onFocus={(e) => e.target.select()}
          className={cn(
            'size-13 rounded-control border border-line bg-surface text-center text-[1.35rem] font-bold text-ink',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25',
            'aria-invalid:border-danger disabled:opacity-60 max-sm:size-11 max-sm:text-[1.1rem]',
          )}
        />
      ))}
    </div>
  )
}
