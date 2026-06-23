import { Check } from 'lucide-react'
import { cx } from '../../lib/utils'

export function Checkbox({ checked, onChange, className, size = 20 }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cx(
        'group relative grid shrink-0 place-items-center rounded-md border transition-all duration-200 ease-spring',
        checked
          ? 'border-accent bg-accent text-accent-fg'
          : 'border-line-strong bg-surface-2 hover:border-accent/60 hover:bg-surface',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Check
        size={size * 0.66}
        strokeWidth={3}
        className={cx(
          'transition-all duration-200',
          checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        )}
      />
    </button>
  )
}
