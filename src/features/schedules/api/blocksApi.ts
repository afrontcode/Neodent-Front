import { apiRequest } from '@/shared/api/apiClient'

export interface AgendaBlock {
  id: number
  odontologoId: number
  sedeId: number | null
  fechaInicio: string
  fechaFin: string
  motivo: string | null
  usuarioId: number
  fechaCreacion: string
}

export interface CreateAgendaBlock {
  odontologoId: number
  sedeId: number | null
  fechaInicio: string
  fechaFin: string
  motivo: string | null
}

export const blocksApi = {
  listar(
    token: string,
    filtros?: {
      odontologoId?: number
      sedeId?: number
    },
  ) {
    const params = new URLSearchParams()

    if (filtros?.odontologoId) {
      params.set(
        'odontologoId',
        String(filtros.odontologoId),
      )
    }

    if (filtros?.sedeId) {
      params.set(
        'sedeId',
        String(filtros.sedeId),
      )
    }

    const query =
      params.toString()
        ? `?${params}`
        : ''

    return apiRequest<AgendaBlock[]>(
      `/api/bloqueos${query}`,
      {
        accessToken: token,
      },
    )
  },

  crear(
    token: string,
    data: CreateAgendaBlock,
  ) {
    return apiRequest<AgendaBlock>(
      '/api/bloqueos',
      {
        method: 'POST',
        accessToken: token,
        body: JSON.stringify(data),
      },
    )
  },

  eliminar(
    token: string,
    id: number,
  ) {
    return apiRequest<void>(
      `/api/bloqueos/${id}`,
      {
        method: 'DELETE',
        accessToken: token,
      },
    )
  },
}