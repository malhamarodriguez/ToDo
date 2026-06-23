import { cx } from '../../lib/utils'

export function PageContainer({ children, className }) {
  return (
    <div className={cx('mx-auto w-full max-w-content px-4 py-6 animate-fade-in sm:px-6 lg:px-8 lg:py-8', className)}>
      {children}
    </div>
  )
}

export function PageHeader({ eyebrow, title, subtitle, actions, className }) {
  return (
    <div className={cx('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
    </div>
  )
}
