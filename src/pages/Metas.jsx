import { Plus, Target, Briefcase, Wallet, HeartPulse, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { GOALS } from '../lib/data'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Badge, ProgressBar, ProgressRing } from '../components/ui'
import { clamp, cx } from '../lib/utils'

const AREA_META = {
  Negocio: { icon: Briefcase, color: '243 76% 64%' },
  Finanzas: { icon: Wallet, color: '158 64% 44%' },
  Salud: { icon: HeartPulse, color: '342 80% 62%' },
  Personal: { icon: Sparkles, color: '36 92% 55%' },
}

const TYPE_LABEL = { percent: 'Porcentaje', numeric: 'Numérico', project: 'Proyecto' }

function pctOf(g) {
  if (g.type === 'percent') return g.value
  if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
  return clamp(Math.round((g.value / g.target) * 100), 0, 100)
}
function valueLabel(g) {
  if (g.type === 'percent') return `${g.value}% de ${g.target}%`
  const u = g.unit || ''
  const fmt = (n) => n.toLocaleString('es-ES')
  return `${fmt(g.value)}${u} de ${fmt(g.target)}${u}`
}

export default function Metas() {
  const { toast } = useApp()
  const areas = [...new Set(GOALS.map((g) => g.area))]
  const done = GOALS.filter((g) => pctOf(g) >= 100).length
  const avg = Math.round(GOALS.reduce((a, g) => a + pctOf(g), 0) / GOALS.length)

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Norte"
        title="Metas"
        subtitle="Lo que mueve la aguja, por área de tu vida."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => toast({ type: 'success', title: 'Nueva meta' })}>
            <span className="hidden sm:inline">Nueva meta</span>
          </Button>
        }
      />

      {/* Resumen */}
      <div className="mb-6 flex flex-wrap items-center gap-5 rounded-xl border border-line bg-surface p-5">
        <ProgressRing value={avg} size={76} stroke={7} />
        <div>
          <p className="font-display text-xl font-bold text-ink">Progreso global {avg}%</p>
          <p className="text-sm text-muted">
            {GOALS.length} metas activas · {done} completada{done === 1 ? '' : 's'}
          </p>
        </div>
        <div className="ml-auto hidden gap-2 sm:flex">
          {areas.map((a) => {
            const Icon = AREA_META[a]?.icon || Target
            return (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-2xs font-medium text-muted"
              >
                <Icon size={13} style={{ color: `hsl(${AREA_META[a]?.color})` }} /> {a}
              </span>
            )
          })}
        </div>
      </div>

      {/* Metas por área */}
      <div className="space-y-8">
        {areas.map((area) => {
          const Icon = AREA_META[area]?.icon || Target
          const color = AREA_META[area]?.color
          const items = GOALS.filter((g) => g.area === area)
          return (
            <section key={area}>
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{ background: `hsl(${color} / 0.14)`, color: `hsl(${color})` }}
                >
                  <Icon size={17} />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">{area}</h2>
                <span className="text-2xs tabular text-subtle">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((g) => {
                  const p = pctOf(g)
                  const complete = p >= 100
                  return (
                    <Card key={g.id} hover>
                      <CardBody>
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <h3 className="text-[15px] font-semibold leading-tight text-ink">{g.title}</h3>
                          <Badge tone={complete ? 'success' : 'neutral'}>{TYPE_LABEL[g.type]}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <ProgressRing value={p} size={56} stroke={6} color={color} />
                          <div className="min-w-0">
                            <p className="font-display text-lg font-bold tabular text-ink">{p}%</p>
                            <p className="truncate text-2xs text-subtle">{valueLabel(g)}</p>
                          </div>
                        </div>
                        <ProgressBar value={p} size="sm" color={color} className="mt-4" />
                      </CardBody>
                    </Card>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </PageContainer>
  )
}
