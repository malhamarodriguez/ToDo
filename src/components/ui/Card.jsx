import { cx } from '../../lib/utils'

export function Card({ className, hover, inset, elevated, children, ...props }) {
  return (
    <div
      className={cx(
        'rounded-xl border border-line bg-surface',
        elevated && 'shadow-lg',
        inset && 'bg-surface-2',
        hover &&
          'transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, action, className }) {
  return (
    <div className={cx('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
            <Icon size={18} strokeWidth={2.1} />
          </span>
        )}
        <div className="min-w-0">
          {title && (
            <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">{title}</h3>
          )}
          {subtitle && <p className="mt-0.5 truncate text-[13px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cx('p-5', className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return (
    <div className={cx('flex items-center gap-3 border-t border-line px-5 py-3.5', className)}>
      {children}
    </div>
  )
}
