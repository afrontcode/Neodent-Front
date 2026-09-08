import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-control border border-line bg-surface px-4 py-3 text-[0.95rem] text-ink',
        'placeholder:text-muted focus:border-brand focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}
