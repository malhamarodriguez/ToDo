import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Printer, TrendingUp, TrendingDown, Wallet, CheckCircle2, Dumbbell, Target, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardHeader, CardBody, Button, ProgressBar, Table, THead, TH, TBody, TR, TD, EmptyState } from '../components/ui'
import { GroupedBars } from '../components/charts'
import { useThemeColors } from '../components/charts/useThemeColors'
import { eur, signedEur, cx, MESES, capitalize, clamp } from '../lib/utils'

const pad = (n) => String(n).padStart(2, '0')

export default function Informe() {
  const { navigate } = useApp()
  const { movements, tasks, workouts, goals } = useData()
  const c = useThemeColors()
  const now = new Date()
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const key = `${cur.y}-${pad(cur.m + 1)}`

  const move = (d) => {
    let m = cur.m + d, y = cur.y
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCur({ y, m })
  }

  const R = useMemo(() => {
    const ms = movements.filter((x) => String(x.date).slice(0, 7) === key)
    const ingresos = ms.filter((x) => x.amount > 0).reduce((a, x) => a + Number(x.amount), 0)
    const gastos = ms.filter((x) => x.amount < 0).reduce((a, x) => a + Math.abs(Number(x.amount)), 0)
    const porCat = {}
    ms.filter((x) => x.amount < 0).forEach((x) => {
      const cat = x.category || 'Sin categoría'
      porCat[cat] = (porCat[cat] || 0) + Math.abs(Number(x.amount))
    })
    const topCats = Object.entries(porCat).sort((a, b) => b[1] - a[1]).slice(0, 6)
    const doneTasks = tasks.filter((t) => t.status === 'done').length
    const trains = workouts.filter((w) => String(w.date).slice(0, 7) === key).length
    return { ms, ingresos, gastos, balance: ingresos - gastos, topCats, doneTasks, trains }
  }, [movements, tasks, workouts, key])

  const goalPct = (g) => {
    if (g.type === 'percent') return Math.round(g.value)
    if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
    return clamp(Math.round((g.value / Math.max(g.target, 1)) * 100), 0, 100)
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Cierre de mes"
        title={`Informe · ${capitalize(MESES[cur.m])} ${cur.y}`}
        subtitle="Tu mes de un vistazo: dinero, trabajo y cuerpo."
        actions={
          <div className="no-print flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" icon={ChevronLeft} onClick={() => move(-1)} />
            <Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => move(1)} />
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('finanzas')}>Finanzas</Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>Imprimir / PDF</Button>
          </div>
        }
      />

      {/* Resumen */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Balance del mes', value: signedEur(R.balance), icon: Wallet, tone: R.balance >= 0 ? 'text-success' : 'text-danger' },
          { label: 'Ingresos', value: eur(R.ingresos), icon: TrendingUp, tone: 'text-ink' },
          { label: 'Gastos', value: eur(R.gastos), icon: TrendingDown, tone: 'text-ink' },
          { label: 'Entrenos', value: R.trains, icon: Dumbbell, tone: 'text-ink' },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted">{s.label}</span>
              <s.icon size={16} className="text-subtle" />
            </div>
            <p className={cx('mt-3 font-display text-[24px] font-bold leading-none tabular', s.tone)}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Gasto por categoría */}
        <Card className="lg:col-span-7">
          <CardHeader title="Gasto por categoría" subtitle="Dónde se fue el dinero" icon={Wallet} />
          <CardBody className="space-y-3 pt-3">
            {R.topCats.length ? (
              R.topCats.map(([cat, val]) => (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-ink">{cat}</span>
                    <span className="tabular font-semibold text-muted">{eur(val)}</span>
                  </div>
                  <ProgressBar value={(val / (R.topCats[0][1] || 1)) * 100} size="sm" />
                </div>
              ))
            ) : (
              <EmptyState icon={Wallet} title="Sin gastos este mes" compact />
            )}
          </CardBody>
        </Card>

        {/* Metas */}
        <Card className="lg:col-span-5">
          <CardHeader title="Metas" subtitle="Estado a cierre de mes" icon={Target} />
          <CardBody className="space-y-3.5 pt-3">
            {goals.length ? (
              goals.slice(0, 6).map((g) => {
                const p = goalPct(g)
                return (
                  <div key={g.id}>
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <span className="font-medium text-ink">{g.title}</span>
                      <span className="tabular font-semibold text-muted">{p}%</span>
                    </div>
                    <ProgressBar value={p} size="sm" />
                  </div>
                )
              })
            ) : (
              <EmptyState icon={Target} title="Sin metas" compact />
            )}
            <div className="rounded-lg bg-surface-2/60 px-3 py-2 text-[13px] text-muted">
              <CheckCircle2 size={13} className="mr-1.5 inline text-success" />
              {R.doneTasks} tareas completadas en total
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Movimientos del mes */}
      <Card className="mt-5">
        <CardHeader title="Movimientos del mes" subtitle={`${R.ms.length} registros`} icon={Wallet} />
        <div className="px-1 pb-2">
          {R.ms.length ? (
            <Table>
              <THead><TH>Concepto</TH><TH>Categoría</TH><TH>Fecha</TH><TH align="right">Importe</TH></THead>
              <TBody>
                {[...R.ms]
                  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                  .map((m) => (
                    <TR key={m.id}>
                      <TD><span className="font-medium">{m.concept}</span></TD>
                      <TD className="text-muted">{m.category || '—'}</TD>
                      <TD className="text-muted">{String(m.date).slice(0, 10)}</TD>
                      <TD align="right"><span className={cx('font-semibold', m.amount > 0 ? 'text-success' : 'text-ink')}>{signedEur(m.amount)}</span></TD>
                    </TR>
                  ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState icon={Wallet} title="Sin movimientos este mes" compact />
          )}
        </div>
      </Card>
    </PageContainer>
  )
}
