import { cx } from '../../lib/utils'

const VARIANTS = {
  primary:
    'bg-accent text-accent-fg shadow-sm hover:shadow-glow hover:brightness-[1.06] active:brightness-95',
  secondary:
    'bg-surface-2 text-ink border border-line hover:border-line-strong hover:bg-elevated active:bg-surface-2',
  outline:
    'border border-line-strong text-ink hover:bg-surface-2 hover:border-accent/50 active:bg-surface',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2 active:bg-surface',
  soft: 'bg-accent/12 text-accent hover:bg-accent/18 active:bg-accent/12 border border-accent/15',
  danger:
    'bg-danger/12 text-danger border border-danger/20 hover:bg-danger/18 active:bg-danger/12',
}

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-lg',
  icon: 'h-10 w-10 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-md',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  icon: Icon,
  iconRight: IconRight,
  as: Tag = 'button',
  ...props
}) {
  const iconOnly = size === 'icon' || size === 'icon-sm'
  const isz = size === 'icon-sm' ? 15 : 17
  return (
    <Tag
      className={cx(
        'inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
        'transition-all duration-200 ease-smooth disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={iconOnly ? 18 : isz} strokeWidth={2.1} className="shrink-0" />}
      {!iconOnly && children}
      {IconRight && <IconRight size={isz} strokeWidth={2.1} className="shrink-0" />}
    </Tag>
  )
}
