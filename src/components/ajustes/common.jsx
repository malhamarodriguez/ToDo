import { useState } from 'react'
import { GripVertical, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardBody, Button } from '../ui'
import { DEFAULT_SETTINGS } from '../../context/AppContext'
import { cx } from '../../lib/utils'

// ---------- Búsqueda de ajustes ----------
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

// ¿El panel coincide con la búsqueda? (título + palabras clave)
export const matches = (q, ...terms) => {
  const nq = norm(q).trim()
  if (!nq) return true
  const hay = norm(terms.join(' '))
  return nq.split(/\s+/).every((w) => hay.includes(w))
}

// Panel de ajustes con búsqueda integrada: se oculta si no coincide.
export function Panel({ q, keys = '', title, subtitle, icon, action, children }) {
  if (!matches(q, title, subtitle, keys)) return null
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} icon={icon} action={action} />
      <CardBody className="pt-4">{children}</CardBody>
    </Card>
  )
}

// ---------- Modificado + restablecer por sección ----------
export function isModified(settings, keys) {
  return keys.some(
    (k) => JSON.stringify(settings[k] ?? null) !== JSON.stringify(DEFAULT_SETTINGS[k] ?? null)
  )
}

export function resetPatch(keys) {
  return Object.fromEntries(keys.map((k) => [k, DEFAULT_SETTINGS[k]]))
}

// Botón de doble confirmación (sin diálogos del navegador)
export function ConfirmButton({ label = 'Restablecer', confirmLabel = '¿Seguro? Pulsa otra vez', onConfirm, size = 'sm', variant = 'ghost' }) {
  const [armed, setArmed] = useState(false)
  return (
    <Button
      variant={armed ? 'danger' : variant}
      size={size}
      icon={RotateCcw}
      onClick={() => {
        if (!armed) {
          setArmed(true)
          setTimeout(() => setArmed(false), 3500)
          return
        }
        setArmed(false)
        onConfirm()
      }}
    >
      {armed ? confirmLabel : label}
    </Button>
  )
}

// Cabecera de sección con chip "modificado" y reset
export function SectionHead({ id, title, settings, keysList, update }) {
  const dirty = isModified(settings, keysList)
  return (
    <div id={id} className="flex items-center justify-between gap-3 pb-1 pt-4 first:pt-0">
      <h2 className="font-mono text-2xs font-medium uppercase tracking-[0.16em] text-subtle">{title}</h2>
      {dirty && (
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-2xs text-accent">
            modificado
          </span>
          <ConfirmButton label="Restablecer sección" onConfirm={() => update(resetPatch(keysList))} />
        </div>
      )}
    </div>
  )
}

// ---------- Lista reordenable (ratón) — las flechas siguen para táctil ----------
export function DndList({ items, onReorder, render, className }) {
  const [dragI, setDragI] = useState(null)
  const [overI, setOverI] = useState(null)
  return (
    <div className={className}>
      {items.map((it, i) => (
        <div
          key={it.id}
          draggable
          onDragStart={(e) => {
            setDragI(i)
            e.dataTransfer.effectAllowed = 'move'
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if (overI !== i) setOverI(i)
          }}
          onDrop={() => {
            if (dragI != null && dragI !== i) {
              const arr = [...items]
              const [moved] = arr.splice(dragI, 1)
              arr.splice(i, 0, moved)
              onReorder(arr)
            }
            setDragI(null)
            setOverI(null)
          }}
          onDragEnd={() => {
            setDragI(null)
            setOverI(null)
          }}
          className={cx(
            'rounded-lg transition-shadow',
            dragI === i && 'opacity-50',
            overI === i && dragI != null && dragI !== i && 'ring-1 ring-accent/60'
          )}
        >
          {render(it, i)}
        </div>
      ))}
    </div>
  )
}

export function Grip() {
  return <GripVertical size={14} className="shrink-0 cursor-grab text-subtle" />
}
