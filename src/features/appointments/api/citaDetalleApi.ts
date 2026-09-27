import { apiRequest } from '@/shared/api/apiClient'

export interface DetalleCita {
  idCita: number
  pacienteId: number
  pacienteNombre: string
  odontologoEspecialidadId: number
  odontologoNombre: string
  especialidadNombre: string
  sedeId: number
  sedeNombre: string
  sedeDireccion: string
  servicioId: number | null
  servicioNombre: string
  estado: string
  fechaHoraInicio: string
  fechaHoraFin: string
}

export const citaDetalleApi = {
  detalle(token: string, id: number) {
    return apiRequest<DetalleCita>(`/api/citas/detalle/${id}`, { accessToken: token })
  },

  agenda(token: string, fecha?: string) {
    const query = fecha ? `?fecha=${fecha}` : ''
    return apiRequest<DetalleCita[]>(`/api/citas/agenda-detalle${query}`, { accessToken: token })
  },
}