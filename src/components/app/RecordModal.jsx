import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { COLOR_CHOICES } from '../../lib/data'
import { cx } from '../../lib/utils'
import { Modal, Button, Label, Input, Textarea, Select, Dot } from '../ui'

// Formulario genérico dirigido por configuración de campos.
// fields: [{ key, label, type, options?, placeholder?, hint?, required?, full?, default? }]
export function RecordModal({ open, onClose, title, subtitle, table, fields, initial, afterSave, onDelete }) {
  const { toast } = useApp()
  const { add, update } = useData()
  const [v, setV] = useState({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    const base = {}
    fields.forEach((f) => {
      base[f.key] = initial?.[f.key] ?? f.default ?? (f.type === 'number' ? '' : f.type === 'color' ? COLOR_CHOICES[0] : '')
    })
    setV(base)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, val) => setV((s) => ({ ...s, [k]: val }))

  const submit = async (e) => {
    e?.preventDefault()
    for (const f of fields) {
      if (f.required && !String(v[f.key] ?? '').trim()) return toast({ type: 'warning', title: `Falta: ${f.label}` })
    }
    const payload = {}
    fields.forEach((f) => {
      let val = v[f.key]
      if (f.type === 'number') val = val === '' ? 0 : Number(val)
      if (f.type === 'date' && (val === '' || val == null)) val = null
      payload[f.key] = val
    })
    setBusy(true)
    const res = initial?.id ? await update(table, initial.id, payload) : await add(table, payload)
    setBusy(false)
    if (res !== null) {
      toast({ type: 'success', title: initial?.id ? 'Guardado' : 'Creado' })
      afterSave?.()
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <>
          {onDelete && (
            <Button
              variant="danger"
              className="mr-auto"
              onClick={() => {
                onDelete()
                onClose()
              }}
            >
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-2 gap-3.5">
        {fields.map((f) => (
          <div key={f.key} className={cx(f.full || f.type === 'textarea' || f.type === 'color' ? 'col-span-2' : 'col-span-2 sm:col-span-1')}>
            <Label hint={f.hint}>{f.label}</Label>
            {f.type === 'select' ? (
              <Select value={v[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            ) : f.type === 'textarea' ? (
              <Textarea placeholder={f.placeholder} value={v[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
            ) : f.type === 'color' ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {COLOR_CHOICES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => set(f.key, c)}
                    className={cx('h-7 w-7 place-items-center rounded-full transition-transform hover:scale-110', v[f.key] === c && 'ring-2 ring-offset-2 ring-offset-surface')}
                    style={{ background: `hsl(${c})`, '--tw-ring-color': `hsl(${c})`, display: 'grid' }}
                  >
                    {v[f.key] === c && <span className="h-2 w-2 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <Input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  step={f.step}
                  placeholder={f.placeholder}
                  value={v[f.key] ?? ''}
                  onChange={(e) => set(f.key, e.target.value)}
                  autoFocus={f.autoFocus}
                  list={f.suggestions?.length ? `dl-${f.key}` : undefined}
                />
                {f.suggestions?.length ? (
                  <datalist id={`dl-${f.key}`}>
                    {f.suggestions.map((sg) => (
                      <option key={sg} value={sg} />
                    ))}
                  </datalist>
                ) : null}
              </>
            )}
          </div>
        ))}
      </form>
    </Modal>
  )
}
