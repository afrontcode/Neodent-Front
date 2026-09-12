import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  /** Texto del botón que confirma la acción. */
  confirmLabel?: string
  /** Texto del botón que vuelve atrás sin hacer nada. */
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Diálogo modal de confirmación. Se cierra con Escape o al hacer clic fuera, y
 * al abrirse mueve el foco al botón de volver, que es la salida segura.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Regresar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[30rem] rounded-card bg-surface px-8 py-9 text-center shadow-menu max-sm:px-5"
      >
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-brand text-white">
          <Icon name="question" size={26} strokeWidth={2.4} />
        </span>

        <h2 id={titleId} className="text-[1.25rem] font-bold text-ink">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-[0.92rem] text-muted">{description}</p>}

        <div className="mt-7 flex gap-3.5 max-sm:flex-col">
          <Button ref={cancelRef} onClick={onCancel} className="flex-1 justify-center">
            {cancelLabel}
          </Button>
          <Button variant="outline" onClick={onConfirm} className="flex-1 justify-center">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
