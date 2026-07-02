import { createPortal } from 'react-dom'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { cx } from '../../lib/utils'

const ICONS = {
  default: Info,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
}
const COLORS = {
  default: 'text-accent',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  danger: 'text-danger',
}

export function Toaster() {
  const { toasts, dismissToast } = useApp()
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2.5 px-4 sm:bottom-4 sm:right-4 sm:items-end sm:px-0 lg:bottom-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-elevated p-3.5 shadow-xl animate-toast-in"
          >
            <Icon size={19} className={cx('shrink-0', COLORS[t.type])} strokeWidth={2.2} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{t.title}</p>
              {t.desc && <p className="mt-0.5 text-[13px] text-muted">{t.desc}</p>}
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action.onClick?.()
                  dismissToast(t.id)
                }}
                className="shrink-0 rounded-md bg-accent/12 px-2.5 py-1.5 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => dismissToast(t.id)}
              className="-m-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
