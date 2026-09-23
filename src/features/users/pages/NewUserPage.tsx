import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Field, Input, MultiSelectChips, PageHead, FieldCheck, FieldError } from '@/shared/components/ui'
import { ApiError } from '@/shared/api/apiClient'
import { usersApi } from '../api/usersApi'
import { useAuth } from '@/features/auth'
import { EMAIL_RE } from '@/shared/lib/validation'

const ROLES = [
    { value: 'RECEPCIONISTA', label: 'Recepcionista' },
    { value: 'ODONTOLOGO', label: 'Odontólogo' },
    { value: 'ADMIN', label: 'Administrador' },
]

const INITIAL = {
    numeroDocumento: '', nombres: '', apellidoPaterno: '', apellidoMaterno: '',
    telefono: '', correo: '', numeroColegiatura: '',
}

type FormKey = keyof typeof INITIAL
type Errors = Partial<Record<FormKey | 'roles' | 'especialidades', string>>

export function NewUserPage() {
    const navigate = useNavigate()
    const { accessToken } = useAuth()

    const [form, setForm] = useState(INITIAL)
    const [roles, setRoles] = useState<string[]>([])
    const [especialidades, setEspecialidades] = useState<{ id: number; nombre: string }[]>([])
    const [especialidadIds, setEspecialidadIds] = useState<string[]>([])

    const [dniValidado, setDniValidado] = useState(false)
    const [datosAutomaticos, setDatosAutomaticos] = useState(false)
    const [checking, setChecking] = useState(false)
    const [saving, setSaving] = useState(false)
    const [cargandoEspecialidades, setCargandoEspecialidades] = useState(false)

    const [, setTouched] = useState<Partial<Record<FormKey, boolean>>>({})
    const [errors, setErrors] = useState<Errors>({})
    const [error, setError] = useState('')

    const requestId = useRef(0)
    const esOdontologo = roles.includes('ODONTOLOGO')
    const camposBloqueados = !dniValidado || datosAutomaticos

    const validarCampo = (key: FormKey, value: string): string => {
        const v = value.trim()
        switch (key) {
            case 'numeroDocumento': return !/^\d{8}$/.test(v) ? 'El DNI debe tener 8 dígitos.' : ''
            case 'nombres': return v.length < 2 ? 'Ingresa los nombres del trabajador.' : ''
            case 'apellidoPaterno': return v.length < 2 ? 'Ingresa el apellido paterno.' : ''
            case 'apellidoMaterno': return v && v.length < 2 ? 'Ingresa un apellido válido.' : ''
            case 'telefono': return v && !/^9\d{8}$/.test(v) ? 'Ingresa un celular válido de 9 dígitos.' : ''
            case 'correo': return !EMAIL_RE.test(v) ? 'Ingresa un correo electrónico válido.' : ''
            case 'numeroColegiatura': return esOdontologo && !v ? 'Ingresa el número de colegiatura.' : ''
            default: return ''
        }
    }

    const update = (key: FormKey, value: string) => {
        setForm(c => ({ ...c, [key]: value }))
        setErrors(c => ({ ...c, [key]: '' }))
        setError('')
    }

    const marcar = (key: FormKey) => {
        setTouched(c => ({ ...c, [key]: true }))
        setErrors(c => {
            const errorLocal = validarCampo(key, form[key])
            return { ...c, [key]: errorLocal || c[key] || '' }
        })
    }

    const check = (key: FormKey) => {
        if (errors[key]) return <FieldError invalid />
        const valor = form[key].trim()
        return <FieldCheck valid={!!valor && !validarCampo(key, valor) &&
            (['nombres', 'apellidoPaterno', 'apellidoMaterno'].includes(key) ? dniValidado : true)} />
    }

    const changeDni = (value: string) => {
        requestId.current++
        setDniValidado(false)
        setDatosAutomaticos(false)
        setChecking(false)
        setTouched(c => ({ ...c, numeroDocumento: false }))
        setErrors(c => ({ ...c, numeroDocumento: '' }))
        setError('')
        setForm(c => ({
            ...c,
            numeroDocumento: value.replace(/\D/g, '').slice(0, 8),
            nombres: '', apellidoPaterno: '', apellidoMaterno: '',
        }))
    }

    useEffect(() => {
        if (!accessToken || form.numeroDocumento.length !== 8) return

        const currentId = ++requestId.current
        const dni = form.numeroDocumento

        const timer = window.setTimeout(async () => {
            setChecking(true)
            try {
                const result = await usersApi.verificarDocumento(accessToken, 1, dni)
                if (currentId !== requestId.current) return

                setDniValidado(result.disponible)
                setDatosAutomaticos(result.encontradoProveedor)
                setTouched(c => ({ ...c, numeroDocumento: true }))
                setForm(c => ({
                    ...c,
                    nombres: result.nombres ?? '',
                    apellidoPaterno: result.apellidoPaterno ?? '',
                    apellidoMaterno: result.apellidoMaterno ?? '',
                }))
                setErrors(c => ({ ...c, numeroDocumento: result.disponible ? '' : 'El documento no está disponible.' }))
            } catch (err) {
                if (currentId !== requestId.current) return
                setDniValidado(false)
                setErrors(c => ({
                    ...c,
                    numeroDocumento: err instanceof ApiError ? err.message : 'No se pudo consultar el documento. Intenta nuevamente.',
                }))
            } finally {
                if (currentId === requestId.current) setChecking(false)
            }
        }, 700)

        return () => window.clearTimeout(timer)
    }, [accessToken, form.numeroDocumento])

    useEffect(() => {
        if (!accessToken) return
        let activo = true
        setCargandoEspecialidades(true)
        usersApi.listarEspecialidades(accessToken)
            .then(data => { if (activo) setEspecialidades(data) })
            .catch(() => { if (activo) setError('No se pudieron cargar las especialidades.') })
            .finally(() => { if (activo) setCargandoEspecialidades(false) })
        return () => { activo = false }
    }, [accessToken])

    const guardar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (saving) return

        const campos: FormKey[] = [
            'numeroDocumento', 'nombres', 'apellidoPaterno', 'apellidoMaterno',
            'telefono', 'correo', ...(esOdontologo ? ['numeroColegiatura' as FormKey] : []),
        ]

        const nuevosErrores: Errors = {}
        campos.forEach(k => {
            const msg = validarCampo(k, form[k])
            if (msg) nuevosErrores[k] = msg
        })

        if (!roles.length) nuevosErrores.roles = 'Selecciona al menos un rol.'
        if (esOdontologo && !especialidadIds.length) nuevosErrores.especialidades = 'Selecciona al menos una especialidad.'

        setTouched(c => ({ ...c, ...Object.fromEntries(campos.map(k => [k, true])) }))
        setErrors(nuevosErrores)
        setError('')

        if (!accessToken) return setError('Tu sesión ha expirado. Inicia sesión nuevamente.')
        if (!dniValidado) return setErrors(c => ({ ...c, numeroDocumento: 'Primero debes validar el DNI.' }))
        if (Object.keys(nuevosErrores).length) return

        setSaving(true)
        try {
            await usersApi.crear(accessToken, {
                correo: form.correo.trim().toLowerCase(),
                roles,
                tipoDocumentoId: 1,
                numeroDocumento: form.numeroDocumento,
                nombres: form.nombres.trim(),
                apellidoPaterno: form.apellidoPaterno.trim(),
                apellidoMaterno: form.apellidoMaterno.trim() || null,
                telefono: form.telefono.trim() || null,
                numeroColegiatura: esOdontologo ? form.numeroColegiatura.trim() : null,
                especialidadIds: esOdontologo ? especialidadIds.map(Number) : [],
            })
            navigate('/usuarios', { replace: true })
        } catch (err) {
            if (err instanceof ApiError) {
                const mensaje = err.message
                const texto = mensaje.toLowerCase()

                if (texto.includes('correo') || texto.includes('email')) {
                    setErrors(c => ({ ...c, correo: mensaje }))
                } else if (texto.includes('documento') || texto.includes('dni')) {
                    setErrors(c => ({ ...c, numeroDocumento: mensaje }))
                } else if (texto.includes('colegiatura')) {
                    setErrors(c => ({ ...c, numeroColegiatura: mensaje }))
                } else if (texto.includes('especialidad')) {
                    setErrors(c => ({ ...c, especialidades: mensaje }))
                } else {
                    setError(mensaje)
                }

                if (err.fieldErrors) setErrors(c => ({ ...c, ...err.fieldErrors }))
            } else {
                setError('No se pudo registrar al trabajador. Intenta nuevamente.')
            }
        } finally {
            setSaving(false)
        }
    }

    const dniHint = checking
        ? 'Consultando DNI…'
        : dniValidado
            ? datosAutomaticos ? 'DNI validado. Datos encontrados ✓' : 'DNI disponible. Completa los datos manualmente ✓'
            : 'Ingresa los 8 dígitos del DNI.'

    return (
        <>
            <PageHead
                title="Nuevo usuario"
                description="Registra al personal e inicia su activación por correo."
                actions={<Button variant="outline" onClick={() => navigate('/usuarios')}>Volver</Button>}
            />

            <Card className="mx-auto max-w-3xl p-6 sm:p-8">
                <form onSubmit={guardar} noValidate className="space-y-5">
                    <div>
                        <label className="mb-2 block text-[0.92rem] font-bold text-ink">
                            Roles del trabajador <span className="text-danger">*</span>
                        </label>
                        <MultiSelectChips
                            options={ROLES}
                            value={roles}
                            onChange={val => { setRoles(val); setErrors(c => ({ ...c, roles: '' })) }}
                            placeholder="Selecciona uno o varios roles"
                            disabled={saving}
                        />
                        {errors.roles
                            ? <p className="mt-1.5 text-xs text-danger">{errors.roles}</p>
                            : <p className="mt-1.5 text-xs text-muted">Puedes asignar más de un rol al mismo trabajador.</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Tipo de documento">
                            <Input value="DNI" disabled />
                        </Field>

                        <Field label="Número de documento *" error={errors.numeroDocumento} hint={dniHint}>
                            <Input
                                placeholder="Ej. 12345678"
                                value={form.numeroDocumento}
                                onChange={e => changeDni(e.target.value)}
                                onBlur={() => marcar('numeroDocumento')}
                                inputMode="numeric"
                                maxLength={8}
                                disabled={saving}
                                trailing={dniValidado && !checking
                                    ? <FieldCheck valid />
                                    : checking
                                        ? <span className="text-muted">…</span>
                                        : null
                                }
                            />
                        </Field>
                    </div>

                    <Field label="Nombres *" error={errors.nombres}>
                        <Input
                            placeholder="Ej. María"
                            value={form.nombres}
                            onChange={e => update('nombres', e.target.value)}
                            onBlur={() => marcar('nombres')}
                            trailing={check('nombres')}
                            disabled={camposBloqueados || saving}
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Apellido paterno *" error={errors.apellidoPaterno}>
                            <Input
                                placeholder="Ej. Rojas"
                                value={form.apellidoPaterno}
                                onChange={e => update('apellidoPaterno', e.target.value)}
                                onBlur={() => marcar('apellidoPaterno')}
                                trailing={check('apellidoPaterno')}
                                disabled={camposBloqueados || saving}
                            />
                        </Field>

                        <Field label="Apellido materno" error={errors.apellidoMaterno}>
                            <Input
                                placeholder="Ej. Pérez"
                                value={form.apellidoMaterno}
                                onChange={e => update('apellidoMaterno', e.target.value)}
                                onBlur={() => marcar('apellidoMaterno')}
                                trailing={check('apellidoMaterno')}
                                disabled={camposBloqueados || saving}
                            />
                        </Field>

                        <Field label="Teléfono" error={errors.telefono}>
                            <Input
                                placeholder="Ej. 987654321"
                                value={form.telefono}
                                onChange={e => update('telefono', e.target.value.replace(/\D/g, '').slice(0, 9))}
                                onBlur={() => marcar('telefono')}
                                trailing={check('telefono')}
                                inputMode="numeric"
                                maxLength={9}
                                disabled={saving}
                            />
                        </Field>

                        <Field label="Correo electrónico *" error={errors.correo}>
                            <Input
                                type="email"
                                placeholder="usuario@neodent.com"
                                value={form.correo}
                                onChange={e => update('correo', e.target.value)}
                                onBlur={() => marcar('correo')}
                                trailing={check('correo')}
                                disabled={saving}
                            />
                        </Field>
                    </div>

                    {esOdontologo && (
                        <div className="space-y-4 rounded-card border border-line p-4">
                            <h2 className="font-bold text-ink">Datos profesionales</h2>

                            <Field label="Número de colegiatura *" error={errors.numeroColegiatura}>
                                <Input
                                    placeholder="Ej. COP 12345"
                                    value={form.numeroColegiatura}
                                    onChange={e => update('numeroColegiatura', e.target.value)}
                                    onBlur={() => marcar('numeroColegiatura')}
                                    trailing={check('numeroColegiatura')}
                                    disabled={saving}
                                />
                            </Field>

                            <div>
                                <label className="mb-2 block text-sm font-bold text-ink">
                                    Especialidades <span className="text-danger">*</span>
                                </label>
                                <MultiSelectChips
                                    options={especialidades.map(e => ({ value: String(e.id), label: e.nombre }))}
                                    value={especialidadIds}
                                    onChange={val => { setEspecialidadIds(val); setErrors(c => ({ ...c, especialidades: '' })) }}
                                    placeholder={cargandoEspecialidades ? 'Cargando especialidades…' : 'Selecciona una o varias especialidades'}
                                    disabled={saving || cargandoEspecialidades}
                                />
                                {errors.especialidades
                                    ? <p className="mt-1.5 text-xs text-danger">{errors.especialidades}</p>
                                    : <p className="mt-1.5 text-xs text-muted">Puedes asignar varias especialidades al odontólogo.</p>}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-muted">
                        * Campos obligatorios. El trabajador recibirá una invitación por correo para activar su cuenta y crear su contraseña.
                    </p>

                    {error && <p role="alert" className="text-sm text-danger">{error}</p>}

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => navigate('/usuarios')} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving || checking || !dniValidado || (esOdontologo && cargandoEspecialidades)}
                        >
                            {saving ? 'Registrando…' : 'Registrar usuario'}
                        </Button>
                    </div>
                </form>
            </Card>
        </>
    )
}