import { Plus, Flame, Dumbbell, Trophy, Timer, Medal, Activity, TrendingDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { makeStreak, WORKOUTS, BODY_METRICS, ACHIEVEMENTS } from '../lib/data'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { TrendArea } from '../components/charts'
import { useThemeColors } from '../components/charts/useThemeColors'
import { Card, CardHeader, CardBody, Button, Badge } from '../components/ui'
import { cx } from '../lib/utils'

const ACH_ICONS = { flame: Flame, dumbbell: Dumbbell, trophy: Trophy, timer: Timer, medal: Medal }
const MES_LBL = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function StreakGrid() {
  const data = makeStreak(363)
  const offset = data[0].date.getDay() // huecos antes del primer día
  const cells = [...Array(offset).fill(null), ...data]
  const total = data.filter((d) => d.level > 0).length

  // Etiquetas de mes (aprox., una por cambio de mes en la primera fila)
  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div
          className="grid w-max gap-[3px]"
          style={{ gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column' }}
        >
          {cells.map((d, i) =>
            d === null ? (
              <span key={i} className="h-[11px] w-[11px]" />
            ) : (
              <span
                key={i}
                title={d.level ? `${d.level} sesión` : 'descanso'}
                className="h-[11px] w-[11px] rounded-[3px] transition-colors"
                style={{
                  backgroundColor: d.level
                    ? `hsl(var(--accent) / ${0.25 + d.level * 0.18})`
                    : 'hsl(var(--border) / 0.6)',
                }}
              />
            )
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-2xs text-subtle">{total} entrenos en el último año</span>
        <div className="flex items-center gap-1.5 text-2xs text-subtle">
          Menos
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="h-[11px] w-[11px] rounded-[3px]"
              style={{
                backgroundColor: l ? `hsl(var(--accent) / ${0.25 + l * 0.18})` : 'hsl(var(--border) / 0.6)',
              }}
            />
          ))}
          Más
        </div>
      </div>
    </div>
  )
}

export default function Deporte() {
  const { toast } = useApp()
  const c = useThemeColors()

  const stats = [
    { label: 'Racha actual', value: '12', unit: 'días', icon: Flame, tone: 'text-warning' },
    { label: 'Este mes', value: '14', unit: 'entrenos', icon: Dumbbell },
    { label: 'Volumen semanal', value: '20.6k', unit: 'kg', icon: Activity },
    { label: 'Peso actual', value: '78,4', unit: 'kg', icon: TrendingDown, tone: 'text-success' },
  ]

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Cuerpo"
        title="Deporte"
        subtitle="Constancia, fuerza y composición corporal."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => toast({ type: 'success', title: 'Registrar entreno' })}>
            <span className="hidden sm:inline">Registrar entreno</span>
          </Button>
        }
      />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted">{s.label}</span>
              <s.icon size={16} className={s.tone || 'text-subtle'} />
            </div>
            <p className="mt-3 font-display text-[26px] font-bold leading-none tabular text-ink">
              {s.value} <span className="text-base font-semibold text-subtle">{s.unit}</span>
            </p>
          </Card>
        ))}
      </div>

      {/* Hábito de entreno */}
      <Card className="mb-5">
        <CardHeader title="Hábito de entreno" subtitle="Tu constancia, día a día" icon={Flame} />
        <CardBody className="pt-3">
          <StreakGrid />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Registro de entrenos */}
        <Card className="lg:col-span-7">
          <CardHeader title="Últimos entrenos" icon={Dumbbell} />
          <CardBody className="space-y-3 pt-3">
            {WORKOUTS.map((w) => (
              <div key={w.id} className="rounded-xl border border-line bg-surface-2/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{w.name}</p>
                    <p className="text-2xs text-subtle">
                      {w.date} · {w.dur} min{w.vol ? ` · ${(w.vol / 1000).toFixed(1)}k kg` : ''}
                    </p>
                  </div>
                  <Badge tone="accent">{w.ex.length} ejercicios</Badge>
                </div>
                <div className="space-y-1.5">
                  {w.ex.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-[13px]">
                      <span className="text-muted">{e.name}</span>
                      <span className="tabular text-ink">
                        {e.sets}
                        {e.kg ? ` · ${e.kg} kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="space-y-5 lg:col-span-5">
          {/* Métricas corporales */}
          <Card>
            <CardHeader title="Composición corporal" subtitle="Peso y % graso" icon={TrendingDown} />
            <CardBody className="pt-3">
              <TrendArea
                data={BODY_METRICS}
                series={[{ key: 'peso', name: 'Peso (kg)', color: c.accent, fill: 0.18 }]}
                fmt={(v) => `${v}`}
                height={180}
              />
            </CardBody>
          </Card>

          {/* Logros */}
          <Card>
            <CardHeader title="Logros" subtitle="4 de 6 desbloqueados" icon={Trophy} />
            <CardBody className="grid grid-cols-3 gap-3 pt-3">
              {ACHIEVEMENTS.map((a) => {
                const Icon = ACH_ICONS[a.icon] || Medal
                return (
                  <div
                    key={a.id}
                    className={cx(
                      'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all',
                      a.got ? 'border-accent/30 bg-accent/[0.06]' : 'border-line bg-surface-2/40 opacity-55'
                    )}
                  >
                    <span
                      className={cx(
                        'grid h-10 w-10 place-items-center rounded-full',
                        a.got ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-subtle'
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="text-2xs font-medium leading-tight text-ink">{a.name}</span>
                  </div>
                )
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
