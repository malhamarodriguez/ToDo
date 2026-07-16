import { cx } from '../../lib/utils'

export function Avatar({ name = '', size = 36, src, className, ring }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      className={cx(
        'inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent/15 font-display font-semibold text-accent',
        ring && 'ring-2 ring-accent/30 ring-offset-2 ring-offset-surface',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials}
    </span>
  )
}

export function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-line bg-surface-2 px-1.5 font-mono text-2xs font-medium text-muted">
      {children}
    </kbd>
  )
}

export function Tooltip({ label, children, side = 'top' }) {
  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side]
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        className={cx(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-line bg-elevated px-2 py-1 text-2xs font-medium text-ink opacity-0 shadow-lg transition-opacity duration-150 group-hover/tt:opacity-100',
          pos
        )}
      >
        {label}
      </span>
    </span>
  )
}

export function SectionTitle({ children, className, action }) {
  return (
    <div className={cx('mb-3 flex items-center justify-between', className)}>
      <h2 className="font-mono text-2xs font-medium uppercase tracking-[0.12em] text-subtle">{children}</h2>
      {action}
    </div>
  )
}
