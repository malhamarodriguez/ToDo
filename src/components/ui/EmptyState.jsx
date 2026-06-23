import { cx } from '../../lib/utils'

export function EmptyState({ icon: Icon, title, desc, action, className, compact }) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8' : 'py-14',
        className
      )}
    >
      {Icon && (
        <div className="relative mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-surface-2 text-subtle">
          <Icon size={24} strokeWidth={1.8} />
          <span className="absolute inset-0 -z-10 rounded-2xl bg-accent/5 blur-xl" />
        </div>
      )}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {desc && <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
