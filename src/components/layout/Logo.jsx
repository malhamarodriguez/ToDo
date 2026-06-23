import { cx } from '../../lib/utils'

// Marca "Núcleo": un núcleo con un electrón en órbita.
export function Mark({ size = 28, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="9" fill="hsl(var(--accent))" />
      <circle cx="16" cy="16" r="3.4" fill="hsl(var(--accent-fg))" />
      <ellipse
        cx="16"
        cy="16"
        rx="9"
        ry="4.2"
        stroke="hsl(var(--accent-fg))"
        strokeWidth="1.6"
        opacity="0.85"
        transform="rotate(38 16 16)"
      />
      <circle cx="23.2" cy="10.4" r="1.9" fill="hsl(var(--accent-fg))" />
    </svg>
  )
}

export function Logo({ size = 28, onClick, collapsed, className }) {
  return (
    <button
      onClick={onClick}
      className={cx('group flex items-center gap-2.5 outline-none', className)}
    >
      <span className="transition-transform duration-300 ease-spring group-hover:rotate-[18deg]">
        <Mark size={size} />
      </span>
      {!collapsed && (
        <span className="flex flex-col items-start leading-none">
          <span className="font-display text-[17px] font-bold tracking-tight text-ink">Núcleo</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">
            Centro de mando
          </span>
        </span>
      )}
    </button>
  )
}
