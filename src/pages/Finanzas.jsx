import { useState } from 'react'
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
  Calculator,
  Repeat,
  Users,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { FINANCE } from '../lib/data'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { TrendArea, GroupedBars, DonutChart, Sparkline } from '../components/charts'
import { useThemeColors } from '../components/charts/useThemeColors'
import {
  Card,
  CardHeader,
  CardBody,
  Stat,
  Button,
  Segmented,
  ProgressBar,
  Badge,
  Dot,
  Table,
  THead,
  TH,
  TBody,
  TR,
  TD,
  SectionTitle,
} from '../components/ui'
import { eur, eur2, signedEur, pct, cx } from '../lib/utils'

const sum = (arr, k) => arr.reduce((a, b) => a + b[k], 0)

export default function Finanzas() {
  const { toast } = useApp()
  const c = useThemeColors()
  const [range, setRange] = useState('12m')
  const f = FINANCE

  const activos = sum(f.assets, 'value')
  const pasivos = sum(f.liabilities, 'value')
  const neto = activos - pasivos

  const beneficioTrim = f.tax.ingresosTrim - f.tax.gastosTrim
  const ivaLiquidar = f.tax.ivaRepercutido - f.tax.ivaSoportado
  const irpf = Math.round(beneficioTrim * 0.2)
  const provisionar = ivaLiquidar + irpf

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Dinero"
        title="Finanzas"
        subtitle="Cashflow, patrimonio e impuestos de tu actividad."
        actions={
          <>
            <Segmented
              size="sm"
              value={range}
              onChange={setRange}
              options={[
                { value: '6m', label: '6M' },
                { value: '12m', label: '12M' },
                { value: 'all', label: 'Todo' },
              ]}
            />
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => toast({ type: 'success', title: 'Nuevo movimiento', desc: 'Formulario de ingreso/gasto.' })}
            >
              <span className="hidden sm:inline">Movimiento</span>
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Balance del mes"
          value={signedEur(f.kpis.balanceMes)}
          delta={12}
          deltaLabel="vs. mes anterior"
          icon={Wallet}
          accent
          spark={<div className="w-20"><Sparkline data={f.flow.map((x) => ({ v: x.ingresos - x.gastos }))} height={34} /></div>}
        />
        <Stat label="Ingresos (mes)" value={eur(f.kpis.ingresosMes)} delta={9} icon={TrendingUp}
          spark={<div className="w-20"><Sparkline data={f.flow.map((x) => ({ v: x.ingresos }))} color={c.success} height={34} /></div>} />
        <Stat label="Gastos (mes)" value={eur(f.kpis.gastosMes)} delta={6} invertDelta icon={TrendingDown}
          spark={<div className="w-20"><Sparkline data={f.flow.map((x) => ({ v: x.gastos }))} color={c.danger} height={34} /></div>} />
        <Stat label="Patrimonio neto" value={eur(neto)} delta={4} icon={Landmark} />
      </div>

      {/* Evolución patrimonio + ahorro */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader
            title="Evolución de patrimonio"
            subtitle="Activos vs. pasivos · últimos 12 meses"
            icon={TrendingUp}
            action={
              <div className="hidden items-center gap-3 sm:flex">
                <span className="flex items-center gap-1.5 text-2xs font-medium text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent" /> Activos
                </span>
                <span className="flex items-center gap-1.5 text-2xs font-medium text-muted">
                  <span className="h-2 w-2 rounded-full bg-danger" /> Pasivos
                </span>
              </div>
            }
          />
          <CardBody className="pt-3">
            <TrendArea
              data={f.networth}
              series={[
                { key: 'activos', name: 'Activos', color: c.accent, fill: 0.2 },
                { key: 'pasivos', name: 'Pasivos', color: c.danger, fill: 0.14 },
              ]}
              fmt={(v) => `${Math.round(v / 1000)}k`}
              height={260}
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Objetivos de ahorro" icon={PiggyBank} />
          <CardBody className="space-y-4 pt-3">
            {f.savings.map((s) => {
              const p = Math.round((s.value / s.target) * 100)
              return (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
                      <Dot color={s.color} size={7} /> {s.name}
                    </span>
                    <span className="text-2xs font-semibold tabular text-muted">{p}%</span>
                  </div>
                  <ProgressBar value={p} size="sm" color={s.color} />
                  <p className="mt-1 text-2xs tabular text-subtle">
                    {eur(s.value)} <span className="text-subtle/70">de {eur(s.target)}</span>
                  </p>
                </div>
              )
            })}
          </CardBody>
        </Card>
      </div>

      {/* Flujo + presupuestos */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader
            title="Ingresos vs. gastos"
            subtitle="Últimos 6 meses"
            icon={TrendingUp}
            action={
              <div className="hidden items-center gap-3 sm:flex">
                <span className="flex items-center gap-1.5 text-2xs font-medium text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent" /> Ingresos
                </span>
                <span className="flex items-center gap-1.5 text-2xs font-medium text-muted">
                  <span className="h-2 w-2 rounded-full bg-line-strong" /> Gastos
                </span>
              </div>
            }
          />
          <CardBody className="pt-3">
            <GroupedBars
              data={f.flow}
              series={[
                { key: 'ingresos', name: 'Ingresos', color: c.accent },
                { key: 'gastos', name: 'Gastos', color: c.border },
              ]}
              fmt={(v) => `${Math.round(v / 1000)}k`}
              height={250}
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader title="Presupuestos por categoría" subtitle="Junio" icon={Wallet} />
          <CardBody className="space-y-3.5 pt-3">
            {f.budgets.map((b) => {
              const p = Math.round((b.spent / b.limit) * 100)
              const over = b.spent > b.limit
              return (
                <div key={b.cat}>
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-ink">{b.cat}</span>
                    <span className={cx('tabular font-semibold', over ? 'text-danger' : 'text-muted')}>
                      {eur(b.spent)} / {eur(b.limit)}
                    </span>
                  </div>
                  <ProgressBar value={Math.min(p, 100)} size="sm" color={over ? '358 70% 60%' : b.color} />
                </div>
              )
            })}
          </CardBody>
        </Card>
      </div>

      {/* Patrimonio + impuestos + recurrentes */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Patrimonio neto" subtitle="Activos y pasivos" icon={Landmark} />
          <CardBody className="pt-1">
            <DonutChart
              data={[
                { name: 'Activos', value: activos, color: '243 76% 64%' },
                { name: 'Pasivos', value: pasivos, color: '358 70% 60%' },
              ]}
              fmt={eur}
              height={180}
            >
              <div>
                <p className="text-2xs uppercase tracking-wide text-subtle">Neto</p>
                <p className="font-display text-xl font-bold tabular text-ink">{eur(neto)}</p>
              </div>
            </DonutChart>
            <div className="mt-2 space-y-1.5">
              <Row label="Activos" value={eur(activos)} color="243 76% 64%" />
              <Row label="Pasivos" value={`−${eur(pasivos)}`} color="358 70% 60%" />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Estimador de impuestos" subtitle="Trimestre actual" icon={Calculator} />
          <CardBody className="pt-2">
            <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4">
              <p className="text-2xs font-medium uppercase tracking-wide text-accent">A provisionar</p>
              <p className="mt-1 font-display text-3xl font-bold tabular text-ink">{eur(provisionar)}</p>
              <p className="mt-1 text-2xs text-muted">Reserva sugerida para Hacienda</p>
            </div>
            <div className="mt-3 space-y-2 text-[13px]">
              <Line label="Beneficio del trimestre" value={eur(beneficioTrim)} />
              <Line label="IVA a liquidar (mod. 303)" value={eur(ivaLiquidar)} />
              <Line label="IRPF · pago fraccionado 20%" value={eur(irpf)} />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Movimientos recurrentes" subtitle="Previsión mensual" icon={Repeat} />
          <CardBody className="space-y-1 pt-2">
            {f.recurring.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                <span
                  className={cx(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-md',
                    r.kind === 'in' ? 'bg-success/12 text-success' : 'bg-surface-2 text-muted'
                  )}
                >
                  <Repeat size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{r.concept}</p>
                  <p className="text-2xs text-subtle">{r.day}</p>
                </div>
                <span className={cx('text-[13px] font-semibold tabular', r.amount > 0 ? 'text-success' : 'text-ink')}>
                  {signedEur(r.amount)}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Movimientos + clientes */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader
            title="Movimientos recientes"
            icon={Wallet}
            action={<Button variant="ghost" size="sm" iconRight={ArrowRight}>Ver todos</Button>}
          />
          <div className="px-1 pb-2">
            <Table>
              <THead>
                <TH>Concepto</TH>
                <TH>Categoría</TH>
                <TH>Fecha</TH>
                <TH align="right">Importe</TH>
              </THead>
              <TBody>
                {f.movements.map((m) => (
                  <TR key={m.id}>
                    <TD>
                      <div className="flex items-center gap-2 font-medium">
                        {m.concept}
                        {m.recurring && <Repeat size={12} className="text-subtle" />}
                      </div>
                    </TD>
                    <TD>
                      <Badge tone="neutral">{m.cat}</Badge>
                    </TD>
                    <TD className="text-muted">{m.date}</TD>
                    <TD align="right">
                      <span className={cx('font-semibold', m.amount > 0 ? 'text-success' : 'text-ink')}>
                        {signedEur(m.amount)}
                      </span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Clientes" subtitle={`${f.clients.length} cuentas`} icon={Users} />
          <CardBody className="space-y-1.5 pt-2">
            {f.clients.map((cl) => (
              <div key={cl.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 font-display text-sm font-bold text-muted">
                  {cl.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{cl.name}</p>
                  <p className="text-2xs text-subtle">{cl.kind}</p>
                </div>
                <div className="text-right">
                  <Badge tone={cl.status === 'Activo' ? 'success' : cl.status === 'Propuesta' ? 'warning' : 'neutral'}>
                    {cl.status}
                  </Badge>
                  {cl.pending > 0 && (
                    <p className="mt-1 text-2xs tabular text-warning">{eur(cl.pending)} pdte.</p>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="flex items-center gap-2 text-muted">
        <Dot color={color} size={7} /> {label}
      </span>
      <span className="font-semibold tabular text-ink">{value}</span>
    </div>
  )
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-line/60 pb-2 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold tabular text-ink">{value}</span>
    </div>
  )
}
