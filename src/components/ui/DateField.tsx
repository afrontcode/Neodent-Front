interface DateFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

/** Selector de fecha (ISO). El icono de calendario lo aporta el control nativo. */
export function DateField({ value, onChange, label = 'Filtrar por fecha' }: DateFieldProps) {
  return (
    <input
      type="date"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-control border border-line bg-surface px-4 py-3 text-[0.95rem] text-ink focus:border-brand focus:outline-none"
    />
  )
}
