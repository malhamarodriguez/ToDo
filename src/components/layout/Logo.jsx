import { cx } from '../../lib/utils'

// Marca "Summa": Σ (sumatorio) — la suma de tu vida en un solo lugar.
// Si el usuario eligió un emoji como icono, la baldosa lo muestra a él.
export function Mark({ size = 28, emoji, className }) {
  if (emoji) {
    return (
      <span
        aria-hidden
        className={cx('grid place-items-center rounded-[9px] bg-accent', className)}
        style={{ width: size, height: size, fontSize: size * 0.58, lineHeight: 1 }}
      >
        {emoji}
      </span>
    )
  }
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

// instance: {name, icon} para mostrar la identidad elegida por el usuario
// dentro de la app. La landing y el acceso siguen siempre con la marca Summa.
export function Logo({ size = 28, onClick, collapsed, instance, className }) {
  const name = instance?.name?.trim() || 'Summa'
  return (
    <button
      onClick={onClick}
      className={cx('group flex items-center gap-2.5 outline-none', className)}
    >
      <span className="transition-transform duration-300 ease-spring group-hover:-rotate-6">
        <Mark size={size} emoji={instance?.icon || null} />
      </span>
      {!collapsed && (
        <span className="flex flex-col items-start leading-none">
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink">{name}</span>
          <span className="mt-1 font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-subtle">
            Todo cuenta.
          </span>
        </span>
      )}
    </button>
  )
}
