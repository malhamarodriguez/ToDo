import { cx } from '../../lib/utils'

export function Switch({ checked, onChange, size = 'md', className }) {
  const w = size === 'lg' ? 'w-[52px] h-7' : 'w-11 h-6'
  const knob = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
  const travel = size === 'lg' ? 'translate-x-6' : 'translate-x-5'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cx(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ease-smooth',
        checked ? 'bg-accent' : 'bg-line-strong',
        w,
        className
      )}
    >
      <span
        className={cx(
          'inline-block transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-spring',
          knob,
          checked ? travel : 'translate-x-0'
        )}
      />
    </button>
  )
}
