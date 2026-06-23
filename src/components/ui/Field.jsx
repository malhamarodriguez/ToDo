import { cx } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

export function Label({ children, hint, className, ...props }) {
  return (
    <label className={cx('mb-1.5 flex items-center justify-between text-[13px] font-medium text-muted', className)} {...props}>
      <span>{children}</span>
      {hint && <span className="text-2xs font-normal text-subtle">{hint}</span>}
    </label>
  )
}

const base =
  'w-full rounded-lg border bg-surface-2 text-sm text-ink placeholder:text-subtle transition-all duration-200 ' +
  'border-line focus:border-accent/60 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-accent/12 ' +
  'disabled:opacity-50'

export function Input({ className, icon: Icon, error, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
      )}
      <input
        className={cx(base, 'h-10', Icon ? 'pl-9 pr-3' : 'px-3.5', error && 'border-danger/60 focus:ring-danger/12', className)}
        {...props}
      />
    </div>
  )
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cx(base, 'min-h-[88px] resize-none px-3.5 py-2.5 leading-relaxed', error && 'border-danger/60', className)}
      {...props}
    />
  )
}

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cx(base, 'h-10 appearance-none px-3.5 pr-9', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle" />
    </div>
  )
}

export function FieldError({ children }) {
  return children ? <p className="mt-1.5 text-2xs text-danger">{children}</p> : null
}
