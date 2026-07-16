import { cx } from '../../lib/utils'

// Marca "Summa": Σ (sumatorio) — la suma de tu vida en un solo lugar.
export function Mark({ size = 28, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="9" fill="hsl(var(--accent))" />
      <path
        d="M21.5 11.5H11.5L17.5 16L11.5 20.5H21.5"
        stroke="hsl(var(--accent-fg))"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ size = 28, onClick, collapsed, className }) {
  return (
    <button
      onClick={onClick}
      className={cx('group flex items-center gap-2.5 outline-none', className)}
    >
      <span className="transition-transform duration-300 ease-spring group-hover:-rotate-6">
        <Mark size={size} />
      </span>
      {!collapsed && (
        <span className="flex flex-col items-start leading-none">
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink">Summa</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">
            Todo cuenta.
          </span>
        </span>
      )}
    </button>
  )
}
