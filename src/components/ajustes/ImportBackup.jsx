import { useState } from 'react'
import { Upload, AlertTriangle, FileJson } from 'lucide-react'
import { Modal, Button, Segmented, Badge } from '../ui'
import { summarizeBackup } from '../../lib/backup'
import { cx } from '../../lib/utils'

const MODES = [
  {
    id: 'fusionar',
    label: 'Fusionar',
    desc: 'Añade lo que falte (por id) y aplica los ajustes. No borra nada.',
  },
  {
    id: 'reemplazar',
    label: 'Reemplazar todo',
    desc: 'Borra tus datos actuales y deja la copia tal cual. Irreversible.',
  },
  {
    id: 'ajustes',
    label: 'Solo ajustes',
    desc: 'Restaura únicamente la configuración; tus datos no se tocan.',
  },
]

// Vista previa de una copia antes de restaurar: qué contiene, de qué
// fecha es, y con qué modo se aplica. Nada se toca sin confirmar.
export function ImportBackupModal({ backup, onClose, onConfirm, busy }) {
  const [mode, setMode] = useState('fusionar')
  if (!backup) return null
  const sum = summarizeBackup(backup)
  const modeMeta = MODES.find((m) => m.id === mode)
  const fecha = sum.exportedAt
    ? new Date(sum.exportedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'fecha desconocida'

  return (
    <Modal
      open
      onClose={busy ? undefined : onClose}
      title="Restaurar copia"
      subtitle={`Copia del ${fecha}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant={mode === 'reemplazar' ? 'danger' : 'primary'}
            icon={Upload}
            onClick={() => onConfirm(mode)}
            disabled={busy}
          >
            {busy ? 'Restaurando…' : mode === 'reemplazar' ? 'Reemplazar mis datos' : 'Restaurar'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Qué contiene */}
        <div className="rounded-xl border border-line bg-surface-2/50 p-3.5">
          <p className="mb-2 flex items-center gap-2 font-mono text-2xs font-medium uppercase tracking-wide text-subtle">
            <FileJson size={13} /> Contenido de la copia
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sum.hasSettings && <Badge tone="accent">Ajustes</Badge>}
            {sum.counts.map((c) => (
              <Badge key={c.table} tone="neutral">
                {c.label} · {c.count}
              </Badge>
            ))}
            {!sum.hasSettings && sum.counts.length === 0 && (
              <span className="text-[13px] text-muted">Copia vacía</span>
            )}
          </div>
        </div>

        {/* Modo */}
        <div>
          <Segmented
            value={mode}
            onChange={setMode}
            className="w-full [&>button]:flex-1"
            options={MODES.map((m) => ({ value: m.id, label: m.label }))}
          />
          <p
            className={cx(
              'mt-2 flex items-start gap-1.5 text-[13px]',
              mode === 'reemplazar' ? 'text-danger' : 'text-muted'
            )}
          >
            {mode === 'reemplazar' && <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
            {modeMeta.desc}
          </p>
        </div>
      </div>
    </Modal>
  )
}
