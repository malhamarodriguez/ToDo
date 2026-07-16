import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

// Lee las variables CSS del tema y las devuelve como colores hsl() resueltos,
// re-evaluando cuando cambia el modo / dirección / acento.
export function useThemeColors() {
  const { settings, resolvedMode } = useApp()
  const [colors, setColors] = useState(read)

  function read() {
    if (typeof window === 'undefined') return {}
    const s = getComputedStyle(document.documentElement)
    const v = (name) => `hsl(${s.getPropertyValue(name).trim()})`
    const va = (name, a) => `hsl(${s.getPropertyValue(name).trim()} / ${a})`
    return {
      accent: v('--accent'),
      violet: v('--viz-2'),
      accentSoft: va('--accent', 0.16),
      grid: va('--border', 0.7),
      axis: v('--text-subtle'),
      text: v('--text'),
      muted: v('--text-muted'),
      surface: v('--surface'),
      elevated: v('--elevated'),
      border: v('--border'),
      success: v('--success'),
      danger: v('--danger'),
      warning: v('--warning'),
      info: v('--info'),
    }
  }

  useEffect(() => {
    // Esperar a que se aplique la transición de tema.
    const id = setTimeout(() => setColors(read()), 60)
    return () => clearTimeout(id)
  }, [settings.mode, settings.direction, settings.accent, resolvedMode])

  return colors
}

export function ChartTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-elevated px-3 py-2 shadow-lg">
      {label != null && <p className="mb-1 text-2xs font-semibold uppercase tracking-wide text-subtle">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px]">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.stroke || p.fill }} />
            <span className="text-muted">{p.name}</span>
            <span className="ml-auto font-semibold tabular text-ink">
              {fmt ? fmt(p.value) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
