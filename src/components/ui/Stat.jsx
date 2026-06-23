import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cx } from '../../lib/utils'
import { Card } from './Card'

export function Stat({ label, value, delta, deltaLabel, icon: Icon, accent, spark, invertDelta, className }) {
  const up = delta != null && delta >= 0
  const good = invertDelta ? !up : up
  return (
    <Card className={cx('p-5', className)}>
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        {Icon && (
          <span
            className={cx(
              'grid h-8 w-8 place-items-center rounded-lg',
              accent ? 'bg-accent/12 text-accent' : 'bg-surface-2 text-muted'
            )}
          >
            <Icon size={16} strokeWidth={2.2} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="font-display text-[26px] font-bold leading-none tabular text-ink">
          {value}
        </span>
        {spark}
      </div>
      {delta != null && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[13px]">
          <span
            className={cx(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-2xs font-semibold',
              good ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'
            )}
          >
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-subtle">{deltaLabel}</span>}
        </div>
      )}
    </Card>
  )
}
