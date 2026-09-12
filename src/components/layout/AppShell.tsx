import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/** Estructura de la aplicación: barra lateral fija, barra superior y área de contenido (ruta hija). */
export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-7 print:overflow-visible print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
