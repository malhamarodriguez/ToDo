import { Check, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { PRO_FEATURES, PRO_PRICE } from '../../lib/plan'
import { Modal, Button, Badge } from '../ui'

export function UpgradeModal() {
  const { upgradeOpen, setUpgradeOpen, toast } = useApp()
  if (!upgradeOpen) return null
  const close = () => setUpgradeOpen(false)
  const reason = typeof upgradeOpen === 'string' ? upgradeOpen : null

  return (
    <Modal
      open
      onClose={close}
      title="Pasa a Núcleo Pro"
      subtitle={reason || 'Desbloquea todo el potencial de tu centro de mando'}
      footer={
        <>
          <Button variant="ghost" onClick={close}>Seguir en Gratis</Button>
          <Button
            variant="primary"
            icon={Sparkles}
            onClick={() => {
              toast({ type: 'info', title: 'Pro llega muy pronto', desc: 'Los pagos se activarán en breve. ¡Gracias por el interés!' })
              close()
            }}
          >
            Mejorar a Pro
          </Button>
        </>
      }
    >
      <div className="mb-4 flex items-end gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-bold tabular text-ink">{PRO_PRICE.monthly}</span>
            <span className="text-sm text-muted">/ mes</span>
          </div>
          <p className="mt-0.5 text-2xs text-subtle">o {PRO_PRICE.yearly}/año (2 meses gratis)</p>
        </div>
        <Badge tone="accent" className="mb-1 ml-auto">14 días de prueba</Badge>
      </div>
      <ul className="space-y-2.5">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/14 text-success">
              <Check size={12} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </Modal>
  )
}
