import { useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, Wallet, Dumbbell, Sparkles, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { MOODS } from '../../lib/data'
import { Modal, Button, Label, Textarea, Select } from '../ui'
import { todayISO, signedEur, cx, taskOverdue } from '../../lib/utils'

const isoDaysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function WeeklyReview() {
  const { reviewOpen, setReviewOpen, toast, setQuickAdd } = useApp()
  const { tasks, movements, workouts, add } = useData()
  const [mood, setMood] = useState('enfocado')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  const stats = useMemo(() => {
    const from = isoDaysAgo(7)
    const doneWeek = tasks.filter((t) => t.status === 'done').length
    const overdue = tasks.filter((t) => taskOverdue(t)).length
    const weekMoves = movements.filter((m) => String(m.date).slice(0, 10) >= from)
    const balance = weekMoves.reduce((a, m) => a + Number(m.amount), 0)
    const trains = workouts.filter((w) => String(w.date).slice(0, 10) >= from).length
    return { doneWeek, overdue, balance, trains }
  }, [tasks, movements, workouts])

  if (!reviewOpen) return null
  const close = () => setReviewOpen(false)

  const save = async () => {
    setBusy(true)
    await add('journal', {
      date: todayISO(),
      mood,
      title: 'Revisión semanal',
      body:
        body.trim() ||
        `Semana cerrada: ${stats.doneWeek} tareas hechas, ${stats.trains} entrenos, balance ${signedEur(stats.balance)}.`,
    })
    setBusy(false)
    toast({ type: 'success', title: 'Semana cerrada 🙌', desc: 'Guardado en tu diario.' })
    close()
  }

  const CARDS = [
    { icon: CheckCircle2, label: 'Tareas completadas', value: stats.doneWeek, tone: 'text-success' },
    { icon: AlertTriangle, label: 'Atrasadas ahora', value: stats.overdue, tone: stats.overdue ? 'text-danger' : 'text-subtle' },
    { icon: Wallet, label: 'Balance 7 días', value: signedEur(stats.balance), tone: stats.balance >= 0 ? 'text-success' : 'text-danger' },
    { icon: Dumbbell, label: 'Entrenos', value: stats.trains, tone: 'text-accent' },
  ]

  return (
    <Modal
      open
      onClose={close}
      size="lg"
      title="Revisión semanal"
      subtitle="Diez minutos para cerrar la semana con claridad"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Ahora no</Button>
          <Button variant="primary" icon={Sparkles} onClick={save} disabled={busy}>
            {busy ? 'Guardando…' : 'Cerrar semana'}
          </Button>
        </>
      }
    >
      {/* 1 · Los números de tu semana */}
      <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.12em] text-subtle">1 · Tu semana en números</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-surface-2/50 p-3 text-center">
            <c.icon size={16} className={cx('mx-auto', c.tone)} />
            <p className="mt-1.5 font-display text-xl font-bold tabular text-ink">{c.value}</p>
            <p className="text-2xs text-subtle">{c.label}</p>
          </div>
        ))}
      </div>

      {/* 2 · Reflexión */}
      <p className="mb-2 mt-6 text-2xs font-semibold uppercase tracking-[0.12em] text-subtle">2 · Reflexión</p>
      <div className="grid gap-3 sm:grid-cols-[140px,1fr]">
        <div>
          <Label>Ánimo</Label>
          <Select value={mood} onChange={(e) => setMood(e.target.value)}>
            {Object.entries(MOODS).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label hint="se guarda en tu diario">¿Qué funcionó? ¿Qué cambiarías?</Label>
          <Textarea
            placeholder="Lo mejor de la semana fue… La semana que viene voy a…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>

      {/* 3 · Prepara la próxima */}
      <p className="mb-2 mt-6 text-2xs font-semibold uppercase tracking-[0.12em] text-subtle">3 · Prepara la próxima</p>
      <button
        onClick={() => {
          close()
          setQuickAdd(true)
        }}
        className="flex w-full items-center justify-between rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted transition-colors hover:border-accent/40 hover:text-ink"
      >
        Crea las 3 tareas clave de la semana que viene
        <ArrowRight size={15} />
      </button>
    </Modal>
  )
}
