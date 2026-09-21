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

export interface CrearUsuarioInternoRequest {
  correo: string
  roles: string[]
  tipoDocumentoId: number
  numeroDocumento: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string | null
  telefono: string | null
  numeroColegiatura: string | null
  especialidadIds: number[]
}

export interface VerificarDocumentoPersonalResponse {
  disponible: boolean
  encontradoProveedor: boolean
  permitirIngresoManual: boolean
  nombres: string | null
  apellidoPaterno: string | null
  apellidoMaterno: string | null
  message: string
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

export interface EspecialidadResponse {
  id: number
  nombre: string
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

  crear(accessToken: string, data: CrearUsuarioInternoRequest) {
    return apiRequest<UsuarioInternoResponse>('/api/usuarios-internos', {
      method: 'POST', accessToken, body: JSON.stringify(data),
    })
  },

  verificarDocumento(accessToken: string, tipoDocumentoId: number, numeroDocumento: string) {
    return apiRequest<VerificarDocumentoPersonalResponse>('/api/usuarios-internos/check-documento', {
      method: 'POST', accessToken,
      body: JSON.stringify({ tipoDocumentoId, numeroDocumento }),
    })
  },

  listarEspecialidades(accessToken: string) {
    return apiRequest<EspecialidadResponse[]>('/api/especialidades', {
      method: 'GET', accessToken,
    })
  },
}