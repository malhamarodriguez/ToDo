import { cx, clamp } from '../../lib/utils'

export function ProgressBar({ value = 0, color, className, track, size = 'md', glow }) {
  const v = clamp(value, 0, 100)
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
  return (
    <div className={cx('w-full overflow-hidden rounded-full', track || 'bg-surface-2', h, className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-smooth"
        style={{
          width: `${v}%`,
          background: color ? `hsl(${color})` : 'hsl(var(--accent))',
          boxShadow: glow ? `0 0 12px hsl(${color || 'var(--accent)'} / 0.55)` : undefined,
        }}
      />
    </div>
  )
}

export function ProgressRing({
  value = 0,
  size = 64,
  stroke = 6,
  color,
  className,
  children,
  label,
}) {
  const v = clamp(value, 0, 100)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (v / 100) * c
  return (
    <div className={cx('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ? `hsl(${color})` : 'hsl(var(--accent))'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        {children || (
          <span className="font-display text-sm font-bold tabular">{Math.round(v)}%</span>
        )}
        {label && <span className="mt-0.5 text-2xs text-subtle">{label}</span>}
      </div>
    </div>
  )
}
