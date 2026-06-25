import { useState } from 'react'
import {
  Plus, Wallet, TrendingUp, TrendingDown, PiggyBank, Landmark, Calculator,
  Repeat, Users, ArrowRight, AlertTriangle, Trash2,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { TrendArea, GroupedBars, DonutChart } from '../components/charts'
import { useThemeColors } from '../components/charts/useThemeColors'
import {
  Card, CardHeader, CardBody, Stat, Button, ProgressBar, Badge, Dot,
  Table, THead, TH, TBody, TR, TD, EmptyState,
} from '../components/ui'
import { RecordModal } from '../components/app/RecordModal'
import { eur, signedEur, cx, todayISO } from '../lib/utils'

const MES_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const mKey = (iso) => String(iso || '').slice(0, 7)

function lastMonths(n) {
  const out = []
  const d = new Date()
  d.setDate(1)
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push({ key: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`, label: MES_ABBR[x.getMonth()] })
  }
  return out
}

const MODALS = {
  movement: {
    title: 'Nuevo movimiento', table: 'movements',
    fields: [
      { key: 'concept', label: 'Concepto', type: 'text', required: true, autoFocus: true, full: true },
      { key: 'category', label: 'Categoría', type: 'text', placeholder: 'Marketing, Software…' },
      { key: 'amount', label: 'Importe (€)', type: 'number', step: '0.01', hint: 'usa negativo para gastos' },
      { key: 'date', label: 'Fecha', type: 'date', default: todayISO() },
    ],
  },
  budget: {
    title: 'Nuevo presupuesto', table: 'budgets',
    fields: [
      { key: 'category', label: 'Categoría', type: 'text', required: true, autoFocus: true },
      { key: 'limit_amount', label: 'Límite (€)', type: 'number' },
      { key: 'spent', label: 'Gastado (€)', type: 'number' },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  saving: {
    title: 'Nuevo objetivo de ahorro', table: 'savings',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true },
      { key: 'value', label: 'Acumulado (€)', type: 'number' },
      { key: 'target', label: 'Objetivo (€)', type: 'number' },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  holding: {
    title: 'Activo o pasivo', table: 'holdings',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true },
      { key: 'value', label: 'Valor (€)', type: 'number' },
      { key: 'kind', label: 'Tipo', type: 'select', options: [{ value: 'asset', label: 'Activo' }, { value: 'liability', label: 'Pasivo' }] },
    ],
  },
  client: {
    title: 'Nuevo cliente', table: 'clients',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true },
      { key: 'kind', label: 'Tipo', type: 'text', placeholder: 'Retainer, Proyecto…' },
      { key: 'monthly', label: 'Mensual (€)', type: 'number' },
      { key: 'pending', label: 'Pendiente (€)', type: 'number' },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'Activo', label: 'Activo' }, { value: 'Propuesta', label: 'Propuesta' }, { value: 'Pausado', label: 'Pausado' }] },
    ],
  },
  recurring: {
    title: 'Movimiento recurrente', table: 'recurring',
    fields: [
      { key: 'concept', label: 'Concepto', type: 'text', required: true, autoFocus: true },
      { key: 'amount', label: 'Importe (€)', type: 'number', hint: 'negativo = gasto' },
      { key: 'day', label: 'Cuándo', type: 'text', placeholder: 'día 1, continuo…' },
    ],
  },
}

export default function Finanzas() {
  const c = useThemeColors()
  const { movements, budgets, savings, holdings, clients, recurring, remove } = useData()
  const [modal, setModal] = useState(null)

  const months = lastMonths(6)
  const flow = months.map(({ key, label }) => {
    const ms = movements.filter((m) => mKey(m.date) === key)
    const ingresos = ms.filter((m) => m.amount > 0).reduce((a, m) => a + Number(m.amount), 0)
    const gastos = ms.filter((m) => m.amount < 0).reduce((a, m) => a + Math.abs(Number(m.amount)), 0)
    return { m: label, ingresos, gastos }
  })
  let run = 0
  const saldo = flow.map((f) => ({ m: f.m, saldo: (run += f.ingresos - f.gastos) }))

  const thisMonth = mKey(todayISO())
  const mThis = movements.filter((m) => mKey(m.date) === thisMonth)
  const ingresosMes = mThis.filter((m) => m.amount > 0).reduce((a, m) => a + Number(m.amount), 0)
  const gastosMes = mThis.filter((m) => m.amount < 0).reduce((a, m) => a + Math.abs(Number(m.amount)), 0)
  const balanceMes = ingresosMes - gastosMes

  const activos = holdings.filter((h) => h.kind !== 'liability').reduce((a, h) => a + Number(h.value), 0)
  const pasivos = holdings.filter((h) => h.kind === 'liability').reduce((a, h) => a + Number(h.value), 0)
  const neto = activos - pasivos

  // Estimador de impuestos (últimos 3 meses como trimestre)
  const q = lastMonths(3).map((x) => x.key)
  const mQ = movements.filter((m) => q.includes(mKey(m.date)))
  const ingresosTrim = mQ.filter((m) => m.amount > 0).reduce((a, m) => a + Number(m.amount), 0)
  const gastosTrim = mQ.filter((m) => m.amount < 0).reduce((a, m) => a + Math.abs(Number(m.amount)), 0)
  const beneficioTrim = ingresosTrim - gastosTrim
  const ivaLiquidar = Math.round((ingresosTrim - gastosTrim) * 0.21)
  const irpf = Math.max(0, Math.round(beneficioTrim * 0.2))
  const provisionar = Math.max(0, ivaLiquidar) + irpf

  const hasMovements = movements.length > 0
  const cfg = modal ? MODALS[modal] : null

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Dinero"
        title="Finanzas"
        subtitle="Cashflow, patrimonio e impuestos de tu actividad."
        actions={<Button variant="primary" icon={Plus} onClick={() => setModal('movement')}><span className="hidden sm:inline">Movimiento</span></Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Balance del mes" value={signedEur(balanceMes)} icon={Wallet} accent highlight />
        <Stat label="Ingresos (mes)" value={eur(ingresosMes)} icon={TrendingUp} />
        <Stat label="Gastos (mes)" value={eur(gastosMes)} icon={TrendingDown} />
        <Stat label="Patrimonio neto" value={eur(neto)} icon={Landmark} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader title="Balance acumulado" subtitle="Saldo neto de tus movimientos" icon={TrendingUp} />
          <CardBody className="pt-3">
            {hasMovements ? (
              <TrendArea data={saldo} series={[{ key: 'saldo', name: 'Saldo', color: c.accent, fill: 0.2 }]} fmt={(v) => `${Math.round(v / 1000)}k`} height={260} />
            ) : <EmptyState icon={TrendingUp} title="Sin movimientos todavía" desc="Registra ingresos y gastos para ver tu evolución." action={<Button size="sm" variant="soft" icon={Plus} onClick={() => setModal('movement')}>Añadir movimiento</Button>} />}
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Objetivos de ahorro" icon={PiggyBank} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => setModal('saving')} />} />
          <CardBody className="space-y-4 pt-3">
            {savings.length ? savings.map((s) => {
              const p = s.target ? Math.round((s.value / s.target) * 100) : 0
              return (
                <div key={s.id} className="group">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-ink"><Dot color={s.color} size={7} /> {s.name}</span>
                    <span className="flex items-center gap-2 text-2xs font-semibold tabular text-muted">{p}%
                      <button onClick={() => remove('savings', s.id)} className="text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"><Trash2 size={12} /></button>
                    </span>
                  </div>
                  <ProgressBar value={p} size="sm" color={s.color} />
                  <p className="mt-1 text-2xs tabular text-subtle">{eur(s.value)} de {eur(s.target)}</p>
                </div>
              )
            }) : <EmptyState icon={PiggyBank} title="Sin objetivos" desc="Crea tu primera meta de ahorro." compact />}
          </CardBody>
        </Card>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Ingresos vs. gastos" subtitle="Últimos 6 meses" icon={TrendingUp} />
          <CardBody className="pt-3">
            {hasMovements ? (
              <GroupedBars data={flow} series={[{ key: 'ingresos', name: 'Ingresos', color: c.accent }, { key: 'gastos', name: 'Gastos', color: c.border }]} fmt={(v) => `${Math.round(v / 1000)}k`} height={250} />
            ) : <EmptyState icon={TrendingUp} title="Sin datos" compact />}
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader title="Presupuestos" subtitle="Por categoría" icon={Wallet} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => setModal('budget')} />} />
          <CardBody className="space-y-3.5 pt-3">
            {budgets.length ? budgets.map((b) => {
              const p = b.limit_amount ? Math.round((b.spent / b.limit_amount) * 100) : 0
              const over = b.spent > b.limit_amount
              return (
                <div key={b.id} className="group">
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-medium text-ink">{b.category}{over && <AlertTriangle size={13} className="text-danger" />}</span>
                    <span className={cx('flex items-center gap-2 tabular font-semibold', over ? 'text-danger' : 'text-muted')}>
                      {eur(b.spent)} / {eur(b.limit_amount)}
                      <button onClick={() => remove('budgets', b.id)} className="text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"><Trash2 size={12} /></button>
                    </span>
                  </div>
                  <ProgressBar value={Math.min(p, 100)} size="sm" color={over ? '358 70% 60%' : b.color} />
                </div>
              )
            }) : <EmptyState icon={Wallet} title="Sin presupuestos" desc="Define límites por categoría." compact />}
          </CardBody>
        </Card>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Patrimonio neto" subtitle="Activos y pasivos" icon={Landmark} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => setModal('holding')} />} />
          <CardBody className="pt-1">
            {holdings.length ? (
              <>
                <DonutChart data={[{ name: 'Activos', value: activos, color: '243 76% 64%' }, { name: 'Pasivos', value: pasivos, color: '358 70% 60%' }]} fmt={eur} height={180}>
                  <div>
                    <p className="text-2xs uppercase tracking-wide text-subtle">Neto</p>
                    <p className="font-display text-xl font-bold tabular text-ink">{eur(neto)}</p>
                  </div>
                </DonutChart>
                <div className="mt-2 space-y-1.5">
                  <Row label="Activos" value={eur(activos)} color="243 76% 64%" />
                  <Row label="Pasivos" value={`−${eur(pasivos)}`} color="358 70% 60%" />
                </div>
              </>
            ) : <EmptyState icon={Landmark} title="Sin patrimonio" desc="Añade activos y pasivos." compact />}
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Estimador de impuestos" subtitle="Últimos 3 meses" icon={Calculator} />
          <CardBody className="pt-2">
            <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4">
              <p className="text-2xs font-medium uppercase tracking-wide text-accent">A provisionar</p>
              <p className="mt-1 font-display text-3xl font-bold tabular text-ink">{eur(provisionar)}</p>
              <p className="mt-1 text-2xs text-muted">Reserva sugerida para Hacienda</p>
            </div>
            <div className="mt-3 space-y-2 text-[13px]">
              <Line label="Beneficio del periodo" value={eur(beneficioTrim)} />
              <Line label="IVA estimado (21%)" value={eur(Math.max(0, ivaLiquidar))} />
              <Line label="IRPF · pago fraccionado 20%" value={eur(irpf)} />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Recurrentes" subtitle="Previsión mensual" icon={Repeat} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => setModal('recurring')} />} />
          <CardBody className="space-y-1 pt-2">
            {recurring.length ? recurring.map((r) => (
              <div key={r.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-md', r.amount > 0 ? 'bg-success/12 text-success' : 'bg-surface-2 text-muted')}><Repeat size={13} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-ink">{r.concept}</p><p className="text-2xs text-subtle">{r.day}</p></div>
                <span className={cx('text-[13px] font-semibold tabular', r.amount > 0 ? 'text-success' : 'text-ink')}>{signedEur(r.amount)}</span>
                <button onClick={() => remove('recurring', r.id)} className="text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"><Trash2 size={12} /></button>
              </div>
            )) : <EmptyState icon={Repeat} title="Sin recurrentes" compact />}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader title="Movimientos recientes" icon={Wallet} action={<Button variant="soft" size="sm" icon={Plus} onClick={() => setModal('movement')}>Añadir</Button>} />
          <div className="px-1 pb-2">
            {movements.length ? (
              <Table>
                <THead><TH>Concepto</TH><TH>Categoría</TH><TH>Fecha</TH><TH align="right">Importe</TH><TH align="right"> </TH></THead>
                <TBody>
                  {movements.slice(0, 12).map((m) => (
                    <TR key={m.id} className="group">
                      <TD><span className="font-medium">{m.concept}</span></TD>
                      <TD>{m.category ? <Badge tone="neutral">{m.category}</Badge> : <span className="text-subtle">—</span>}</TD>
                      <TD className="text-muted">{m.date}</TD>
                      <TD align="right"><span className={cx('font-semibold', m.amount > 0 ? 'text-success' : 'text-ink')}>{signedEur(m.amount)}</span></TD>
                      <TD align="right"><button onClick={() => remove('movements', m.id)} className="text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"><Trash2 size={14} /></button></TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            ) : <EmptyState icon={Wallet} title="Sin movimientos" desc="Registra tu primer ingreso o gasto." action={<Button size="sm" variant="primary" icon={Plus} onClick={() => setModal('movement')}>Nuevo movimiento</Button>} />}
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader title="Clientes" subtitle={`${clients.length} cuentas`} icon={Users} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => setModal('client')} />} />
          <CardBody className="space-y-1.5 pt-2">
            {clients.length ? clients.map((cl) => (
              <div key={cl.id} className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 font-display text-sm font-bold text-muted">{cl.name[0]}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-ink">{cl.name}</p><p className="text-2xs text-subtle">{cl.kind}</p></div>
                <div className="text-right">
                  <Badge tone={cl.status === 'Activo' ? 'success' : cl.status === 'Propuesta' ? 'warning' : 'neutral'}>{cl.status}</Badge>
                  {cl.pending > 0 && <p className="mt-1 text-2xs tabular text-warning">{eur(cl.pending)} pdte.</p>}
                </div>
                <button onClick={() => remove('clients', cl.id)} className="text-subtle opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"><Trash2 size={13} /></button>
              </div>
            )) : <EmptyState icon={Users} title="Sin clientes" desc="Añade tus cuentas." compact />}
          </CardBody>
        </Card>
      </div>

      {cfg && (
        <RecordModal open onClose={() => setModal(null)} title={cfg.title} table={cfg.table} fields={cfg.fields} />
      )}
    </PageContainer>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="flex items-center gap-2 text-muted"><Dot color={color} size={7} /> {label}</span>
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
