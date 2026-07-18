import { useState } from 'react'
import { Plus, Target, Briefcase, Wallet, HeartPulse, Sparkles, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ventureFilter, venturesOf } from '../lib/ventures'
import { VentureChips } from '../components/app/VentureChips'
import { useData } from '../context/DataContext'
import { AREAS } from '../lib/data'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Badge, ProgressBar, ProgressRing, EmptyState } from '../components/ui'
import { RecordModal } from '../components/app/RecordModal'
import { clamp, cx } from '../lib/utils'
import { canCreate, FREE_LIMITS } from '../lib/plan'

const AREA_META = {
  Negocio: { icon: Briefcase, color: 'var(--viz-1)' },
  Finanzas: { icon: Wallet, color: 'var(--viz-3)' },
  Salud: { icon: HeartPulse, color: 'var(--viz-5)' },
  Personal: { icon: Sparkles, color: 'var(--viz-4)' },
}
const TYPE_LABEL = { percent: 'Porcentaje', numeric: 'Numérico', project: 'Proyecto' }

function pctOf(g) {
  if (g.type === 'percent') return Math.round(g.value)
  if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
  return clamp(Math.round((g.value / Math.max(g.target, 1)) * 100), 0, 100)
}
function valueLabel(g) {
  const fmt = (n) => Number(n).toLocaleString('es-ES')
  if (g.type === 'percent') return `${fmt(g.value)}% de ${fmt(g.target)}%`
  const u = g.unit || ''
  return `${fmt(g.value)}${u} de ${fmt(g.target)}${u}`
}

export default function Metas() {
  const { setUpgradeOpen, settings } = useApp()
  const { goals: allGoals, remove, isPro } = useData()
  const [vSel, setVSel] = useState('todos')
  const goals = ventureFilter(settings, allGoals, vSel)
  const [open, setOpen] = useState(false)
  const newGoal = () => {
    if (!canCreate('goals', goals.length, isPro)) {
      return setUpgradeOpen(`El plan Gratis incluye ${FREE_LIMITS.goals} metas — pasa a Pro para crear ilimitadas.`)
    }
    setOpen(true)
  }

  const usedAreas = AREAS.filter((a) => goals.some((g) => g.area === a))
  const done = goals.filter((g) => pctOf(g) >= 100).length
  const avg = goals.length ? Math.round(goals.reduce((a, g) => a + pctOf(g), 0) / goals.length) : 0

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Norte"
        title="Metas"
        subtitle="Lo que mueve la aguja, por área de tu vida."
        actions={<Button variant="primary" icon={Plus} onClick={newGoal}><span className="hidden sm:inline">Nueva meta</span></Button>}
      />

      <VentureChips settings={settings} rows={allGoals} value={vSel} onChange={setVSel} className="mb-4" />

      {goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="Aún no tienes metas" desc="Define objetivos por área (negocio, finanzas, salud, personal) y sigue su progreso." action={<Button variant="primary" icon={Plus} onClick={newGoal}>Crear primera meta</Button>} />
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-5 rounded-xl border border-line bg-surface p-5">
            <ProgressRing value={avg} size={76} stroke={7} />
            <div>
              <p className="font-display text-xl font-bold text-ink">Progreso global {avg}%</p>
              <p className="text-sm text-muted">{goals.length} metas activas · {done} completada{done === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="space-y-8">
            {usedAreas.map((area) => {
              const Icon = AREA_META[area]?.icon || Target
              const color = AREA_META[area]?.color
              const items = goals.filter((g) => g.area === area)
              return (
                <section key={area}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `hsl(${color} / 0.14)`, color: `hsl(${color})` }}><Icon size={17} /></span>
                    <h2 className="font-display text-lg font-bold text-ink">{area}</h2>
                    <span className="text-2xs tabular text-subtle">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((g) => {
                      const p = pctOf(g)
                      const complete = p >= 100
                      return (
                        <Card key={g.id} hover className="group cursor-pointer" role="button" onClick={() => setOpen({ row: g })}>
                          <CardBody>
                            <div className="mb-3 flex items-start justify-between gap-2">
                              <h3 className="text-[15px] font-semibold leading-tight text-ink">{g.title}</h3>
                              <Badge tone={complete ? 'success' : 'neutral'}>{TYPE_LABEL[g.type]}</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              {settings.goalStyle !== 'numero' && (
                                <ProgressRing value={p} size={56} stroke={6} color={color} />
                              )}
                              <div className="min-w-0">
                                <p className="font-display text-lg font-bold tabular text-ink">{p}%</p>
                                <p className="truncate text-2xs text-subtle">{valueLabel(g)}</p>
                              </div>
                            </div>
                            {(settings.goalStyle || 'barra') === 'barra' && (
                              <ProgressBar value={p} size="sm" color={color} className="mt-4" />
                            )}
                          </CardBody>
                        </Card>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}

      {open && (
      <RecordModal
        open
        onClose={() => setOpen(false)}
        title={open.row ? 'Editar meta' : 'Nueva meta'}
        subtitle={open.row ? 'Actualiza el progreso o los datos' : 'Define el objetivo y su medida'}
        table="goals"
        initial={open.row}
        onDelete={open.row ? () => remove('goals', open.row.id) : undefined}
        fields={[
          { key: 'title', label: 'Título', type: 'text', required: true, autoFocus: true, full: true },
          { key: 'area', label: 'Área', type: 'select', options: AREAS.map((a) => ({ value: a, label: a })) },
          { key: 'type', label: 'Tipo', type: 'select', options: [{ value: 'percent', label: 'Porcentaje' }, { value: 'numeric', label: 'Numérico' }, { value: 'project', label: 'Proyecto' }] },
          { key: 'value', label: 'Actual', type: 'number', default: 0 },
          { key: 'target', label: 'Objetivo', type: 'number', default: 100 },
          { key: 'unit', label: 'Unidad', type: 'text', placeholder: '€, kg, hitos…' },
          { key: 'venture', label: 'Venture', type: 'select', default: '', options: venturesOf(settings).map((v) => ({ value: v.id === 'personal' ? '' : v.id, label: `${v.icon} ${v.name}` })) },
        ]}
      />
      )}
    </PageContainer>
  )
}
