import type { SVGProps } from 'react'

/**
 * Catálogo de iconos (trazos sobre una caja de 24x24). Para añadir uno nuevo
 * basta con agregar una entrada aquí y usar <Icon name="..." />.
 */
const ICONS = {
  usuarios: <><rect x="8" y="3" width="8" height="4" rx="1" /><rect x="4" y="5" width="16" height="16" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M8.5 18c.6-1.6 1.9-2.4 3.5-2.4s2.9.8 3.5 2.4" /></>,
  citas: <><rect x="8" y="3" width="8" height="4" rx="1" /><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M12 11v5M9.5 13.5h5" /></>,
  pacientes: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 6a3 3 0 010 6M21 20c0-2.5-1.5-4.6-3.6-5.5" /></>,
  logout: <><path d="M15 12H3M7 8l-4 4 4 4" /><path d="M11 4h6a2 2 0 012 2v12a2 2 0 01-2 2h-6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
  calendarEdit: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /><path d="M11 13h2M11 17h4" /></>,
  bell: <><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  printer: <><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 01-2-2v-4a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="7" rx="1" /></>,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><path d="M10 11v5M14 11v5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  kebab: <><circle cx="12" cy="5" r="1.8" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.8" fill="currentColor" stroke="none" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  file: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></>,
  xCircle: <><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></>,
  warning: <path d="M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />,
  spinner: <path d="M12 3a9 9 0 019 9" />,
}

export type IconName = keyof typeof ICONS

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
  strokeWidth?: number
}

export function Icon({ name, size = 18, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {ICONS[name]}
    </svg>
  )
}
