import { cx } from '../../lib/utils'

// Control segmentado (p.ej. Lista / Kanban)
export function Segmented({ options, value, onChange, size = 'md', className }) {
  const h = size === 'sm' ? 'h-8' : 'h-9'
  const pad = size === 'sm' ? 'px-2.5 text-[13px]' : 'px-3.5 text-sm'
  return (
    <div className={cx('inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-2 p-0.5', h === 'h-8' ? '' : '', className)}>
      {options.map((o) => {
        const active = o.value === value
        const Icon = o.icon
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-md font-medium transition-all duration-200',
              h,
              pad,
              active
                ? 'bg-surface text-ink shadow-sm'
                : 'text-muted hover:text-ink'
            )}
          >
            {Icon && <Icon size={15} strokeWidth={2.2} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// Tabs subrayados
export function Tabs({ options, value, onChange, className }) {
  return (
    <div className={cx('flex items-center gap-1 border-b border-line', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              'relative -mb-px px-3.5 py-2.5 text-sm font-medium transition-colors',
              active ? 'text-ink' : 'text-muted hover:text-ink'
            )}
          >
            {o.label}
            {o.count != null && (
              <span className="ml-1.5 rounded-full bg-surface-2 px-1.5 py-0.5 text-2xs tabular text-muted">
                {o.count}
              </span>
            )}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        )
      })}
    </div>
  )
}
