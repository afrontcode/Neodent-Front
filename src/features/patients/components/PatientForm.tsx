import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatedSelect, Button, Card, DateField, Field, FieldCheck, FieldError, Input } from '@/shared/components/ui'
import { documentTypesApi, type TipoDocumentoOption } from '@/shared/api/documentTypesApi'
import { EMAIL_RE } from '@/shared/lib/validation'
import { useAuth } from '@/features/auth'
import { patientsApi, type ActualizarPacienteRequest, type CrearPacienteRequest, type PacienteResponse } from '../api/patientsApi'

const PHONE_RE = /^\+?\d{7,15}$/
const DOCUMENT_DELAY = 1500
const FIELD_DELAY = 600

type Values = {
  tipoDocumento: string
  numeroDocumento: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  telefono: string
  email: string
  direccion: string
}

type Errors = Partial<Record<keyof Values, string>>

function useDelayedValid(valid: boolean, key: string, delay = FIELD_DELAY) {
  const [confirmed, setConfirmed] = useState<string | null>(null)

  useEffect(() => {
    if (!valid) {
      setConfirmed(null)
      return
    }

    const timer = window.setTimeout(
      () => setConfirmed(key),
      delay,
    )

    return () => window.clearTimeout(timer)
  }, [valid, key, delay])

  return valid && confirmed === key
}

interface Props {
  paciente?: PacienteResponse | null
  saving?: boolean
  onSubmit: (
    data: CrearPacienteRequest | ActualizarPacienteRequest,
  ) => Promise<void>
  onCancel: () => void
}

export function PatientForm({
  paciente,
  saving = false,
  onSubmit,
  onCancel,
}: Props) {
  const { accessToken } = useAuth()
  const editing = Boolean(paciente)

  const [tipos, setTipos] = useState<TipoDocumentoOption[]>([])
  const [values, setValues] = useState<Values>({
    tipoDocumento: paciente?.tipoDocumento ?? 'DNI',
    numeroDocumento: paciente?.numeroDocumento ?? '',
    nombres: paciente?.nombres ?? '',
    apellidoPaterno: paciente?.apellidoPaterno ?? '',
    apellidoMaterno: paciente?.apellidoMaterno ?? '',
    fechaNacimiento: paciente?.fechaNacimiento ?? '',
    telefono: paciente?.telefono ?? '',
    email: paciente?.email ?? '',
    direccion: paciente?.direccion ?? '',
  })

  const [errors, setErrors] = useState<Errors>({})
  const [checking, setChecking] = useState(false)
  const [dniListo, setDniListo] = useState(
    editing && paciente?.tipoDocumento === 'DNI',
  )
  const [manualReady, setManualReady] = useState(
    editing && paciente?.tipoDocumento !== 'DNI',
  )

  useEffect(() => {
    documentTypesApi.listar()
      .then(setTipos)
      .catch(() => setTipos([]))
  }, [])

  const tipo = tipos.find(
    t => t.codigo === values.tipoDocumento,
  )

  const esDni = values.tipoDocumento === 'DNI'
  const minDoc = tipo?.longitudMin ?? (esDni ? 8 : 1)
  const maxDoc = tipo?.longitudMax ?? (esDni ? 8 : 20)

  const errorDocumento = useMemo(() => {
    const v = values.numeroDocumento.trim()

    if (!v) return 'Ingresa el número de documento.'

    if (v.length < minDoc || v.length > maxDoc) {
      return minDoc === maxDoc
        ? `El documento debe tener ${minDoc} caracteres.`
        : `El documento debe tener entre ${minDoc} y ${maxDoc} caracteres.`
    }

    if (esDni && !/^\d{8}$/.test(v)) {
      return 'El DNI debe tener exactamente 8 dígitos.'
    }

    return ''
  }, [values.numeroDocumento, minDoc, maxDoc, esDni])

  useEffect(() => {
    if (editing) return

    if (esDni || errorDocumento || !values.numeroDocumento) {
      setManualReady(false)
      return
    }

    const timer = window.setTimeout(
      () => setManualReady(true),
      DOCUMENT_DELAY,
    )

    return () => window.clearTimeout(timer)
  }, [
    editing,
    esDni,
    errorDocumento,
    values.numeroDocumento,
  ])

  useEffect(() => {
    if (
      editing ||
      !accessToken ||
      !esDni ||
      !/^\d{8}$/.test(values.numeroDocumento)
    ) {
      if (!editing) setDniListo(false)
      return
    }

    let activo = true

    setChecking(true)
    setDniListo(false)

    const timer = window.setTimeout(() => {
      patientsApi.consultarDni(
        accessToken,
        values.numeroDocumento,
      )
        .then(response => {
          if (!activo) return

          setValues(v => ({
            ...v,
            nombres: response.nombres ?? '',
            apellidoPaterno: response.apellidoPaterno ?? '',
            apellidoMaterno: response.apellidoMaterno ?? '',
          }))

          setErrors(e => ({
            ...e,
            numeroDocumento: '',
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
          }))

          setDniListo(true)
        })
        .catch(() => {
          if (activo) setDniListo(true)
        })
        .finally(() => {
          if (activo) setChecking(false)
        })
    }, DOCUMENT_DELAY)

    return () => {
      activo = false
      window.clearTimeout(timer)
    }
  }, [
    editing,
    accessToken,
    esDni,
    values.numeroDocumento,
  ])

  const set = (key: keyof Values, value: string) => {
    setValues(v => ({ ...v, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validar = () => {
    const e: Errors = {}

    if (!editing && errorDocumento) {
      e.numeroDocumento = errorDocumento
    }

    if (values.nombres.trim().length < 2) {
      e.nombres = 'Ingresa los nombres del paciente.'
    }

    if (values.apellidoPaterno.trim().length < 2) {
      e.apellidoPaterno = 'Ingresa el apellido paterno.'
    }

    if (
      values.apellidoMaterno.trim() &&
      values.apellidoMaterno.trim().length < 2
    ) {
      e.apellidoMaterno = 'Ingresa un apellido válido.'
    }

    const hoy = new Date().toLocaleDateString(
      'en-CA',
      { timeZone: 'America/Lima' },
    )

    if (
      values.fechaNacimiento &&
      values.fechaNacimiento > hoy
    ) {
      e.fechaNacimiento = 'La fecha no puede ser futura.'
    }

    if (
      values.telefono.trim() &&
      !PHONE_RE.test(values.telefono.trim())
    ) {
      e.telefono = 'Ingresa un teléfono válido.'
    }

    if (
      values.email.trim() &&
      !EMAIL_RE.test(values.email.trim())
    ) {
      e.email = 'Ingresa un correo válido.'
    }

    return e
  }

  const nombreOk = useDelayedValid(
    values.nombres.trim().length >= 2,
    values.nombres,
  )

  const paternoOk = useDelayedValid(
    values.apellidoPaterno.trim().length >= 2,
    values.apellidoPaterno,
  )

  const telefonoOk = useDelayedValid(
    !values.telefono || PHONE_RE.test(values.telefono),
    values.telefono,
  )

  const emailOk = useDelayedValid(
    !values.email || EMAIL_RE.test(values.email),
    values.email,
  )

  const indicator = (
    key: keyof Values,
    ok: boolean,
  ) =>
    errors[key]
      ? <FieldError invalid />
      : ok && values[key]
        ? <FieldCheck valid />
        : null

  const guardar = async (e: FormEvent) => {
    e.preventDefault()

    const found = validar()
    setErrors(found)

    if (Object.keys(found).length) return

    if (
      !editing &&
      !(esDni ? dniListo : manualReady)
    ) {
      setErrors(current => ({
        ...current,
        numeroDocumento:
          'Espera la validación del documento.',
      }))
      return
    }

    if (editing) {
      await onSubmit({
        nombres: values.nombres.trim(),
        apellidoPaterno: values.apellidoPaterno.trim(),
        apellidoMaterno:
          values.apellidoMaterno.trim() || null,
        fechaNacimiento:
          values.fechaNacimiento || null,
        telefono:
          values.telefono.trim() || null,
        email:
          values.email.trim().toLowerCase() || null,
        direccion:
          values.direccion.trim() || null,
      })

      return
    }

    await onSubmit({
      tipoDocumento: values.tipoDocumento,
      numeroDocumento: values.numeroDocumento.trim(),
      nombres: values.nombres.trim(),
      apellidoPaterno: values.apellidoPaterno.trim(),
      apellidoMaterno:
        values.apellidoMaterno.trim() || null,
      fechaNacimiento:
        values.fechaNacimiento || null,
      telefono:
        values.telefono.trim() || null,
      email:
        values.email.trim().toLowerCase() || null,
      direccion:
        values.direccion.trim() || null,
    })
  }

  return (
    <Card className="mx-auto w-full max-w-5xl p-4 sm:p-7">
      <form
        onSubmit={guardar}
        className="grid min-w-0 gap-4"
        noValidate
      >
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo de documento *">
            <AnimatedSelect
              value={values.tipoDocumento}
              options={tipos.map(t => ({
                value: t.codigo,
                label: `${t.codigo} · ${t.nombre}`,
              }))}
              onChange={value => {
                set('tipoDocumento', value)
                set('numeroDocumento', '')
                setDniListo(false)
                setManualReady(false)
              }}
              disabled={editing || saving}
            />
          </Field>

          <Field
            label="Número de documento *"
            error={errors.numeroDocumento}
          >
            <Input
              value={values.numeroDocumento}
              disabled={editing || saving}
              inputMode={esDni ? 'numeric' : 'text'}
              maxLength={maxDoc}
              onChange={e =>
                set(
                  'numeroDocumento',
                  esDni
                    ? e.target.value
                        .replace(/\D/g, '')
                        .slice(0, maxDoc)
                    : e.target.value
                        .toUpperCase()
                        .replace(/\s/g, '')
                        .slice(0, maxDoc),
                )
              }
              trailing={
                checking
                  ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
                  )
                  : !editing && (dniListo || manualReady)
                    ? <FieldCheck valid />
                    : null
              }
            />
          </Field>
        </div>

        <Field label="Nombres *" error={errors.nombres}>
          <Input
            value={values.nombres}
            onChange={e => set('nombres', e.target.value)}
            disabled={saving}
            trailing={indicator('nombres', nombreOk)}
          />
        </Field>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Apellido paterno *"
            error={errors.apellidoPaterno}
          >
            <Input
              value={values.apellidoPaterno}
              onChange={e =>
                set('apellidoPaterno', e.target.value)
              }
              disabled={saving}
              trailing={indicator(
                'apellidoPaterno',
                paternoOk,
              )}
            />
          </Field>

          <Field
            label="Apellido materno"
            error={errors.apellidoMaterno}
          >
            <Input
              value={values.apellidoMaterno}
              onChange={e =>
                set('apellidoMaterno', e.target.value)
              }
              disabled={saving}
            />
          </Field>

          <Field
            label="Fecha de nacimiento"
            error={errors.fechaNacimiento}
          >
            <DateField
              value={values.fechaNacimiento}
              onChange={val => set('fechaNacimiento', val)}
              placeholder="dd/mm/aaaa"
              max={new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' })}
              min="1900-01-01"
              align="left"
              defaultViewDate="2000-01-01"
              disabled={saving}
            />
          </Field>

          <Field label="Teléfono" error={errors.telefono}>
            <Input
              value={values.telefono}
              inputMode="tel"
              maxLength={16}
              onChange={e =>
                set(
                  'telefono',
                  e.target.value
                    .replace(/[^\d+]/g, '')
                    .replace(/(?!^)\+/g, '')
                    .slice(0, 16),
                )
              }
              disabled={saving}
              trailing={indicator('telefono', telefonoOk)}
            />
          </Field>
        </div>

        <Field
          label="Correo electrónico"
          error={errors.email}
        >
          <Input
            type="email"
            value={values.email}
            onChange={e => set('email', e.target.value)}
            disabled={saving}
            trailing={indicator('email', emailOk)}
          />
        </Field>

        <Field label="Dirección">
          <Input
            value={values.direccion}
            onChange={e => set('direccion', e.target.value)}
            disabled={saving}
          />
        </Field>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={saving || checking}
          >
            {saving
              ? 'Guardando…'
              : editing
                ? 'Guardar cambios'
                : 'Registrar paciente'}
          </Button>
        </div>
      </form>
    </Card>
  )
}