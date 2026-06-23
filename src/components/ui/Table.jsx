import { cx } from '../../lib/utils'

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cx('w-full border-collapse text-sm', className)}>{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return (
    <thead>
      <tr className="border-b border-line text-left">{children}</tr>
    </thead>
  )
}

export function TH({ children, className, align }) {
  return (
    <th
      className={cx(
        'px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-subtle',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </th>
  )
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>
}

export function TR({ children, className, ...props }) {
  return (
    <tr
      className={cx(
        'border-b border-line/70 transition-colors last:border-0 hover:bg-surface-2/60',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TD({ children, className, align }) {
  return (
    <td className={cx('px-4 py-3 text-ink', align === 'right' && 'text-right tabular', className)}>
      {children}
    </td>
  )
}
