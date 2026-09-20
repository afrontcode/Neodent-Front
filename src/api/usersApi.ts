import { apiRequest } from './apiClient'

export interface UsuarioInternoResponse {
  usuarioId: number
  aliasInterno: string
  correo: string
  estado: string
  roles: string[]

  personalId: number
  tipoDocumentoId: number
  numeroDocumento: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  telefono: string | null
  personalActivo: boolean

  odontologoId: number | null
  numeroColegiatura: string | null
  especialidadIds: number[]
  especialidades: string[]
}

export interface PaginaResponse<T> {
  contenido: T[]
  pagina: number
  tamanoPagina: number
  totalElementos: number
  totalPaginas: number
  esPrimera: boolean
  esUltima: boolean
}

interface ListarUsuariosParams {
  buscar?: string
  rol?: string
  activo?: boolean
  page: number
  size: number
}

export const usersApi = {
  listar(
    accessToken: string,
    params: ListarUsuariosParams,
  ) {
    const query = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      sortBy: 'id',
      direction: 'desc',
    })

    if (params.buscar?.trim()) {
      query.set('buscar', params.buscar.trim())
    }

    if (params.rol) {
      query.set('rol', params.rol)
    }

    if (params.activo !== undefined) {
      query.set('activo', String(params.activo))
    }

    return apiRequest<PaginaResponse<UsuarioInternoResponse>>(
      `/api/usuarios-internos?${query.toString()}`,
      {
        method: 'GET',
        accessToken,
      },
    )
  },
}