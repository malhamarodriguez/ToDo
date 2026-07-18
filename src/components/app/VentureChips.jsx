import { venturesOf, usedVentures, anyTagged } from '../../lib/ventures'
import { cx } from '../../lib/utils'

// Chips de filtro por venture. Solo aparecen si hay filas etiquetadas
// (quien no usa ventures, no los ve). Sin navegación nueva.
export function VentureChips({ settings, rows, value, onChange, className }) {
  if (!anyTagged(rows)) return null
  const used = usedVentures(settings, rows)
  if (used.length < 2) return null
  const all = [{ id: 'todos', name: 'Todos', color: null }, ...used]
  return (
    <div className={cx('flex flex-wrap items-center gap-1.5', className)}>
      {all.map((v) => {
        const active = (value || 'todos') === v.id
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={cx(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium transition-colors',
              active ? 'border-accent bg-accent/12 text-accent' : 'border-line text-muted hover:text-ink'
            )}
          >
            {v.color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(${v.color})` }} />}
            {v.name}
          </button>
        )
      })}
    </div>
  )
}

// Punto de color del venture en una fila (nada si es personal)
export function VentureDot({ settings, row, size = 6 }) {
  const id = row?.venture
  if (!id || id === 'personal') return null
  const v = venturesOf(settings).find((x) => x.id === id)
  if (!v) return null
  return (
    <span
      title={v.name}
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: `hsl(${v.color})` }}
    />
  )
}
