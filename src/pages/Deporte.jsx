import { useState } from 'react'
import { Plus, Flame, Dumbbell, Trophy, Timer, Medal, Activity, TrendingDown, Trash2, Scale } from 'lucide-react'
import { useData } from '../context/DataContext'
import { streakFromDates, ACHIEVEMENTS } from '../lib/data'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { TrendArea } from '../components/charts'
import { useThemeColors } from '../components/charts/useThemeColors'
import { Card, CardHeader, CardBody, Button, Badge, EmptyState } from '../components/ui'
import { RecordModal } from '../components/app/RecordModal'
import { cx, todayISO, relDay } from '../lib/utils'

const ACH_ICONS = { flame: Flame, dumbbell: Dumbbell, trophy: Trophy, timer: Timer, medal: Medal }

function StreakGrid({ dates }) {
  const data = streakFromDates(dates)
  const offset = data[0].date.getDay()
  const cells = [...Array(offset).fill(null), ...data]
  const total = data.filter((d) => d.level > 0).length
  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="grid w-max gap-[3px]" style={{ gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column' }}>
          {cells.map((d, i) =>
            d === null ? <span key={i} className="h-[11px] w-[11px]" /> : (
              <span key={i} className="h-[11px] w-[11px] rounded-[3px]"
                style={{ backgroundColor: d.level ? `hsl(var(--accent) / ${0.25 + d.level * 0.18})` : 'hsl(var(--border) / 0.6)' }} />
            )
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-2xs text-subtle">{total} entrenos en el último año</span>
        <div className="flex items-center gap-1.5 text-2xs text-subtle">
          Menos
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="h-[11px] w-[11px] rounded-[3px]" style={{ backgroundColor: l ? `hsl(var(--accent) / ${0.25 + l * 0.18})` : 'hsl(var(--border) / 0.6)' }} />
          ))}
          Más
        </div>
      </div>
    </div>
  )
}

const isoOf = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10) }

export default function Deporte() {
  const c = useThemeColors()
  const { workouts, metrics, remove } = useData()
  const [modal, setModal] = useState(null)

  const dateSet = new Set(workouts.map((w) => String(w.date).slice(0, 10)))
  let streak = 0
  const cur = new Date()
  if (!dateSet.has(isoOf(cur))) cur.setDate(cur.getDate() - 1)
  while (dateSet.has(isoOf(cur))) { streak++; cur.setDate(cur.getDate() - 1) }

  const thisMonth = todayISO().slice(0, 7)
  const monthCount = workouts.filter((w) => String(w.date).slice(0, 7) === thisMonth).length
  const sortedMetrics = [...metrics].sort((a, b) => String(a.date).localeCompare(String(b.date)))
  const lastWeight = sortedMetrics.length ? sortedMetrics[sortedMetrics.length - 1].weight : null

  const achStats = { total: workouts.length, streak }
  const sortedWorkouts = [...workouts].sort((a, b) => String(b.date).localeCompare(String(a.date)))

  const stats = [
    { label: 'Racha actual', value: streak, unit: 'días', icon: Flame, tone: 'text-warning' },
    { label: 'Este mes', value: monthCount, unit: 'entrenos', icon: Dumbbell },
    { label: 'Total', value: workouts.length, unit: 'sesiones', icon: Activity },
    { label: 'Peso actual', value: lastWeight ?? '—', unit: lastWeight ? 'kg' : '', icon: TrendingDown, tone: 'text-success' },
  ]

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Cuerpo"
        title="Deporte"
        subtitle="Constancia, fuerza y composición corporal."
        actions={
          <>
            <Button variant="secondary" icon={Scale} onClick={() => setModal('metric')}><span className="hidden sm:inline">Peso</span></Button>
            <Button variant="primary" icon={Plus} onClick={() => setModal('workout')}><span className="hidden sm:inline">Registrar entreno</span></Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} hover className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted">{s.label}</span>
              <s.icon size={16} className={s.tone || 'text-subtle'} />
            </div>
            <p className="mt-3 font-display text-[26px] font-bold leading-none tabular text-ink">{s.value} <span className="text-base font-semibold text-subtle">{s.unit}</span></p>
          </Card>
        ))}
      </div>

      <Card className="mb-5">
        <CardHeader title="Hábito de entreno" subtitle="Tu constancia, día a día" icon={Flame} />
        <CardBody className="pt-3"><StreakGrid dates={workouts.map((w) => w.date)} /></CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Últimos entrenos" icon={Dumbbell} />
          <CardBody className="space-y-3 pt-3">
            {sortedWorkouts.length ? sortedWorkouts.slice(0, 8).map((w) => (
              <div
                key={w.id}
                role="button"
                onClick={() => setModal({ type: 'workout', row: w })}
                className="group cursor-pointer rounded-xl border border-line bg-surface-2/40 p-4 transition-colors hover:border-line-strong"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{w.name}</p>
                    <p className="text-2xs text-subtle">{relDay(w.date)}{w.dur ? ` · ${w.dur} min` : ''}</p>
                  </div>
                  {w.exercises?.length > 0 && <Badge tone="accent">{w.exercises.length} ejercicios</Badge>}
                </div>
                {w.exercises?.length > 0 && (
                  <div className="space-y-1.5">
                    {w.exercises.map((e, i) => (
                      <div key={i} className="flex items-center justify-between text-[13px]">
                        <span className="text-muted">{e.name}</span>
                        <span className="tabular text-ink">{e.sets}{e.kg ? ` · ${e.kg} kg` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )) : <EmptyState icon={Dumbbell} title="Sin entrenos registrados" desc="Marca tu primer entreno y empieza la racha." action={<Button size="sm" variant="primary" icon={Plus} onClick={() => setModal('workout')}>Registrar entreno</Button>} />}
          </CardBody>
        </Card>

        <div className="space-y-5 lg:col-span-5">
          <Card>
            <CardHeader title="Composición corporal" subtitle="Peso registrado" icon={TrendingDown} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => setModal('metric')} />} />
            <CardBody className="pt-3">
              {sortedMetrics.length > 1 ? (
                <TrendArea data={sortedMetrics.map((m) => ({ m: relDay(m.date), peso: m.weight }))} series={[{ key: 'peso', name: 'Peso (kg)', color: c.accent, fill: 0.18 }]} fmt={(v) => `${v}`} height={180} />
              ) : <EmptyState icon={Scale} title="Sin métricas" desc="Registra tu peso para ver la evolución." compact />}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Logros" subtitle={`${ACHIEVEMENTS.filter((a) => a.need(achStats)).length} de ${ACHIEVEMENTS.length}`} icon={Trophy} />
            <CardBody className="grid grid-cols-3 gap-3 pt-3">
              {ACHIEVEMENTS.map((a) => {
                const Icon = ACH_ICONS[a.icon] || Medal
                const got = a.need(achStats)
                return (
                  <div key={a.id} className={cx('flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all', got ? 'border-accent/30 bg-accent/[0.06]' : 'border-line bg-surface-2/40 opacity-55')}>
                    <span className={cx('grid h-10 w-10 place-items-center rounded-full', got ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-subtle')}><Icon size={18} /></span>
                    <span className="text-2xs font-medium leading-tight text-ink">{a.name}</span>
                  </div>
                )
              })}
            </CardBody>
          </Card>
        </div>
      </div>

      {(modal === 'workout' || modal?.type === 'workout') && (
        <RecordModal open onClose={() => setModal(null)}
          title={modal?.row ? 'Editar entreno' : 'Registrar entreno'}
          subtitle={modal?.row ? undefined : 'Marca tu sesión de hoy'}
          table="workouts"
          initial={modal?.row}
          onDelete={modal?.row ? () => remove('workouts', modal.row.id) : undefined}
          fields={[
            { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true, placeholder: 'Empuje, Carrera…', full: true },
            { key: 'date', label: 'Fecha', type: 'date', default: todayISO() },
            { key: 'dur', label: 'Duración (min)', type: 'number' },
          ]} />
      )}
      {modal === 'metric' && (
        <RecordModal open onClose={() => setModal(null)} title="Registrar peso" table="metrics"
          fields={[
            { key: 'date', label: 'Fecha', type: 'date', default: todayISO() },
            { key: 'weight', label: 'Peso (kg)', type: 'number', step: '0.1', autoFocus: true },
            { key: 'fat', label: '% graso', type: 'number', step: '0.1' },
          ]} />
      )}
    </PageContainer>
  )
}
