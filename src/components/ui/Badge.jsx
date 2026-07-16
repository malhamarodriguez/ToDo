import { cx } from '../../lib/utils'

const TONES = {
  neutral: 'bg-surface-2 text-muted border-line',
  accent: 'bg-accent/12 text-accent border-accent/20',
  success: 'bg-success/12 text-success border-success/20',
  warning: 'bg-warning/14 text-warning border-warning/25',
  danger: 'bg-danger/12 text-danger border-danger/20',
  info: 'bg-info/12 text-info border-info/20',
}

export function Badge({ tone = 'neutral', dot, icon: Icon, className, children, ...props }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-2xs font-medium uppercase tracking-wide',
        TONES[tone],
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </span>
  )
}

// Punto / chip de color libre (proyectos, prioridades)
export function Dot({ color, size = 8, className, ring }) {
  return (
    <span
      className={cx('inline-block shrink-0 rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: `hsl(${color})`,
        boxShadow: ring ? `0 0 0 3px hsl(${color} / 0.18)` : undefined,
      }}
    />
  )
}

// Chip con color de proyecto
export function Chip({ color, children, className }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-2xs font-medium',
        className
      )}
      style={{
        color: color ? `hsl(${color})` : undefined,
        backgroundColor: color ? `hsl(${color} / 0.12)` : undefined,
      }}
    >
      {color && <Dot color={color} size={6} />}
      {children}
    </span>
  )
}
