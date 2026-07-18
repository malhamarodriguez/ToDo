import { useState } from 'react'
import {
  Plus, Wallet, TrendingUp, TrendingDown, PiggyBank, Landmark, Calculator,
  Repeat, Users, ArrowRight, AlertTriangle, Banknote, Pencil, CheckCircle2, FileBarChart,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { TrendArea, GroupedBars, DonutChart } from '../components/charts'
import { useThemeColors } from '../components/charts/useThemeColors'
import {
  Card, CardHeader, CardBody, Stat, Button, ProgressBar, Badge, Dot,
  Table, THead, TH, TBody, TR, TD, EmptyState, Modal, Label, Input,
} from '../components/ui'
import { RecordModal } from '../components/app/RecordModal'
import { eur, signedEur, cx, todayISO } from '../lib/utils'
import { canCreate, FREE_LIMITS } from '../lib/plan'

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
    title: 'Nuevo movimiento', noun: 'movimiento', table: 'movements',
    fields: [
      { key: 'concept', label: 'Concepto', type: 'text', required: true, autoFocus: true, full: true },
      { key: 'category', label: 'Categoría', type: 'text', placeholder: 'Marketing, Software…' },
      { key: 'amount', label: 'Importe (€)', type: 'number', step: '0.01', hint: 'usa negativo para gastos' },
      { key: 'date', label: 'Fecha', type: 'date', default: todayISO() },
      { key: 'deductible', label: 'Gasto deducible', type: 'boolean', hint: 'su IVA resta en el modelo 303' },
    ],
  },
  budget: {
    title: 'Nuevo presupuesto', noun: 'presupuesto', table: 'budgets',
    fields: [
      { key: 'category', label: 'Categoría', type: 'text', required: true, autoFocus: true },
      { key: 'limit_amount', label: 'Límite (€)', type: 'number' },
      { key: 'spent', label: 'Gastado (€)', type: 'number' },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  saving: {
    title: 'Nuevo objetivo de ahorro', noun: 'objetivo', table: 'savings',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true },
      { key: 'value', label: 'Acumulado (€)', type: 'number' },
      { key: 'target', label: 'Objetivo (€)', type: 'number' },
      { key: 'color', label: 'Color', type: 'color' },
    ],
  },
  holding: {
    title: 'Añadir al patrimonio', noun: 'elemento', table: 'holdings',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true, placeholder: 'Cuenta, fondo, préstamo…' },
      { key: 'value', label: 'Valor (€)', type: 'number' },
      { key: 'kind', label: 'Tipo', type: 'select', options: [{ value: 'asset', label: 'Activo (lo que tienes)' }, { value: 'liability', label: 'Pasivo (lo que debes)' }] },
    ],
  },
  client: {
    title: 'Nuevo cliente', noun: 'cliente', table: 'clients',
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true },
      { key: 'kind', label: 'Tipo', type: 'text', placeholder: 'Retainer, Proyecto…' },
      { key: 'monthly', label: 'Mensual (€)', type: 'number' },
      { key: 'pending', label: 'Pendiente (€)', type: 'number' },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'Activo', label: 'Activo' }, { value: 'Propuesta', label: 'Propuesta' }, { value: 'Pausado', label: 'Pausado' }] },
    ],
  },
  recurring: {
    title: 'Movimiento recurrente', noun: 'recurrente', table: 'recurring',
    fields: [
      { key: 'concept', label: 'Concepto', type: 'text', required: true, autoFocus: true },
      { key: 'amount', label: 'Importe (€)', type: 'number', hint: 'negativo = gasto' },
      { key: 'day', label: 'Cuándo', type: 'text', placeholder: 'día 1, continuo…' },
    ],
  },
}

function SalaryModal({ open, onClose }) {
  const { settings, update, toast } = useApp()
  const [val, setVal] = useState(settings.salary || '')
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tu nómina"
      subtitle="Tu ingreso fijo mensual neto"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => { update({ salary: Number(val) || 0 }); toast({ type: 'success', title: 'Nómina guardada' }); onClose() }}>Guardar</Button>
        </>
      }
    >
      <Label hint="€ al mes">Importe de la nómina</Label>
      <Input type="number" step="0.01" autoFocus value={val} onChange={(e) => setVal(e.target.value)} placeholder="0" />
    </Modal>
  )
}

export default function Finanzas() {
  const { settings, toast, setUpgradeOpen, navigate } = useApp()
  const c = useThemeColors()
  const { movements, budgets, savings, holdings, clients, recurring, add, remove, isPro } = useData()
  const [modal, setModal] = useState(null) // 'movement' | {type,row} | 'salary'

  // Límites del plan Gratis en colecciones "pro"
  const GATES = {
    client: ['clients', () => clients.length, FREE_LIMITS.clients, 'clientes'],
    budget: ['budgets', () => budgets.length, FREE_LIMITS.budgets, 'presupuestos'],
    saving: ['savings', () => savings.length, FREE_LIMITS.savings, 'objetivos de ahorro'],
  }
  const guardedOpen = (type) => {
    const g = GATES[type]
    if (g && !canCreate(g[0], g[1](), isPro)) {
      return setUpgradeOpen(`El plan Gratis incluye ${g[2]} ${g[3]} — pasa a Pro para crear ilimitados.`)
    }
    setModal(type)
  }

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

  const assetItems = holdings.filter((h) => h.kind !== 'liability')
  const liabItems = holdings.filter((h) => h.kind === 'liability')
  const activos = assetItems.reduce((a, h) => a + Number(h.value), 0)
  const pasivos = liabItems.reduce((a, h) => a + Number(h.value), 0)
  const neto = activos - pasivos

  const q = lastMonths(3).map((x) => x.key)
  const mQ = movements.filter((m) => q.includes(mKey(m.date)))
  const ingresosTrim = mQ.filter((m) => m.amount > 0).reduce((a, m) => a + Number(m.amount), 0)
  const gastosTrim = mQ.filter((m) => m.amount < 0).reduce((a, m) => a + Math.abs(Number(m.amount)), 0)
  const beneficioTrim = ingresosTrim - gastosTrim
  const ivaLiquidar = Math.round((ingresosTrim - gastosTrim) * 0.21)
  const irpf = Math.max(0, Math.round(beneficioTrim * 0.2))
  const provisionar = Math.max(0, ivaLiquidar) + irpf

  const salary = Number(settings.salary) || 0
  const nominaThisMonth = mThis.some((m) => (m.category || '').toLowerCase() === 'nómina' || (m.concept || '').toLowerCase() === 'nómina')
  const registrarNomina = async () => {
    if (!salary) return setModal('salary')
    await add('movements', { concept: 'Nómina', category: 'Nómina', amount: salary, date: todayISO(), kind: 'in' })
    toast({ type: 'success', title: 'Nómina registrada', desc: eur(salary) })
  }

  const hasMovements = movements.length > 0

  // Fijos (recurrentes) aún sin registrar este mes → registro en un clic
  const pendingFixed = recurring.filter(
    (r) => !mThis.some((m) => (m.concept || '').toLowerCase() === (r.concept || '').toLowerCase())
  )
  const logAllFixed = async () => {
    for (const r of pendingFixed) {
      await add('movements', {
        concept: r.concept,
        category: r.amount > 0 ? 'Ingreso fijo' : 'Gasto fijo',
        amount: Number(r.amount),
        date: todayISO(),
        recurring: true,
      })
    }
    toast({ type: 'success', title: 'Fijos registrados', desc: `${pendingFixed.length} movimientos añadidos.` })
  }

  // helpers de modal
  const openNew = (type) => setModal(type)
  const openEdit = (type, row) => setModal({ type, row })
  let cfg = modal && modal !== 'salary' ? MODALS[typeof modal === 'string' ? modal : modal.type] : null
  // Categorías del usuario (Ajustes → Módulos → Finanzas) como sugerencias
  if (cfg) {
    const catNames = (settings.financeCategories || []).map((c) => c.name).filter(Boolean)
    if (catNames.length) {
      cfg = { ...cfg, fields: cfg.fields.map((f) => (f.key === 'category' ? { ...f, suggestions: catNames } : f)) }
    }
  }
  const editingRow = typeof modal === 'object' && modal ? modal.row : null

  const rowCls = 'group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2'

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Dinero"
        title="Finanzas"
        subtitle="Nómina, ingresos y gastos, y patrimonio. Toca cualquier elemento para editarlo."
        actions={
          <>
            <Button variant="secondary" icon={FileBarChart} onClick={() => navigate('informe')}>
              <span className="hidden sm:inline">Informe</span>
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => openNew('movement')}><span className="hidden sm:inline">Movimiento</span></Button>
          </>
        }
      />

      {pendingFixed.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
          <Repeat size={16} className="shrink-0 text-accent" />
          <p className="min-w-0 flex-1 text-[13px] text-ink">
            Tienes <strong>{pendingFixed.length} fijo{pendingFixed.length === 1 ? '' : 's'}</strong> sin registrar este mes
            <span className="text-muted"> · {pendingFixed.map((r) => r.concept).slice(0, 3).join(', ')}{pendingFixed.length > 3 ? '…' : ''}</span>
          </p>
          <Button variant="primary" size="sm" onClick={logAllFixed}>Registrar todos</Button>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Balance del mes" value={signedEur(balanceMes)} icon={Wallet} accent highlight />
        <Stat label="Ingresos (mes)" value={eur(ingresosMes)} icon={TrendingUp} />
        <Stat label="Gastos (mes)" value={eur(gastosMes)} icon={TrendingDown} />
        <Stat label="Patrimonio neto" value={eur(neto)} icon={Landmark} />
      </div>

      {/* Nómina + Balance acumulado */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Nómina" subtitle="Tu ingreso fijo mensual" icon={Banknote}
            action={<Button variant="ghost" size="icon-sm" icon={Pencil} onClick={() => setModal('salary')} />} />
          <CardBody className="pt-2">
            <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4">
              <p className="text-2xs font-medium uppercase tracking-wide text-accent">Cada mes</p>
              <p className="mt-1 font-display text-3xl font-bold tabular text-ink">{salary ? eur(salary) : '— €'}</p>
              <p className="mt-1 text-2xs text-muted">{salary ? 'neto al mes' : 'aún sin definir'}</p>
            </div>
            {nominaThisMonth ? (
              <div className="mt-3 flex items-center gap-2 text-[13px] text-success">
                <CheckCircle2 size={15} /> Registrada este mes
              </div>
            ) : (
              <Button variant="soft" size="sm" icon={Plus} className="mt-3 w-full" onClick={registrarNomina}>
                Registrar nómina de este mes
              </Button>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-8">
          <CardHeader title="Balance acumulado" subtitle="Saldo neto de tus movimientos" icon={TrendingUp} />
          <CardBody className="pt-3">
            {hasMovements ? (
              <TrendArea data={saldo} series={[{ key: 'saldo', name: 'Saldo', color: c.accent, fill: 0.2 }]} fmt={(v) => `${Math.round(v / 1000)}k`} height={220} />
            ) : <EmptyState icon={TrendingUp} title="Sin movimientos todavía" desc="Registra ingresos y gastos para ver tu evolución." action={<Button size="sm" variant="soft" icon={Plus} onClick={() => openNew('movement')}>Añadir movimiento</Button>} />}
          </CardBody>
        </Card>
      </div>

      {/* Ingresos y gastos (movimientos) */}
      <Card className="mb-5">
        <CardHeader title="Ingresos y gastos" subtitle="Tus movimientos · toca uno para editar o eliminar" icon={Wallet}
          action={<Button variant="soft" size="sm" icon={Plus} onClick={() => openNew('movement')}>Añadir</Button>} />
        <div className="px-1 pb-2">
          {movements.length ? (
            <Table>
              <THead><TH>Concepto</TH><TH>Categoría</TH><TH>Fecha</TH><TH align="right">Importe</TH></THead>
              <TBody>
                {movements.slice(0, 20).map((m) => (
                  <TR key={m.id} className="cursor-pointer" onClick={() => openEdit('movement', m)}>
                    <TD><span className="font-medium">{m.concept}</span></TD>
                    <TD>{m.category ? (
                      <Badge tone="neutral">
                        {(() => {
                          const cat = (settings.financeCategories || []).find((c) => c.name === m.category)
                          return cat?.color ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(${cat.color})` }} /> : null
                        })()}
                        {m.category}
                      </Badge>
                    ) : <span className="text-subtle">—</span>}</TD>
                    <TD className="text-muted">{m.date}</TD>
                    <TD align="right"><span className={cx('font-semibold', m.amount > 0 ? 'text-success' : 'text-ink')}>{signedEur(m.amount)}</span></TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : <EmptyState icon={Wallet} title="Sin movimientos" desc="Registra tu primer ingreso o gasto." action={<Button size="sm" variant="primary" icon={Plus} onClick={() => openNew('movement')}>Nuevo movimiento</Button>} />}
        </div>
      </Card>

      {/* Flujo + presupuestos */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader title="Ingresos vs. gastos" subtitle="Últimos 6 meses" icon={TrendingUp} />
          <CardBody className="pt-3">
            {hasMovements ? (
              <GroupedBars data={flow} series={[{ key: 'ingresos', name: 'Ingresos', color: c.accent }, { key: 'gastos', name: 'Gastos', color: c.violet }]} fmt={(v) => `${Math.round(v / 1000)}k`} height={250} />
            ) : <EmptyState icon={TrendingUp} title="Sin datos" compact />}
          </CardBody>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader title="Presupuestos" subtitle="Toca para editar" icon={Wallet} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => guardedOpen('budget')} />} />
          <CardBody className="space-y-1 pt-2">
            {budgets.length ? budgets.map((b) => {
              const p = b.limit_amount ? Math.round((b.spent / b.limit_amount) * 100) : 0
              const over = b.spent > b.limit_amount
              return (
                <button key={b.id} onClick={() => openEdit('budget', b)} className="w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2">
                  <div className="mb-1.5 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 font-medium text-ink">{b.category}{over && <AlertTriangle size={13} className="text-danger" />}</span>
                    <span className={cx('tabular font-semibold', over ? 'text-danger' : 'text-muted')}>{eur(b.spent)} / {eur(b.limit_amount)}</span>
                  </div>
                  <ProgressBar value={Math.min(p, 100)} size="sm" color={over ? 'var(--danger)' : b.color} />
                </button>
              )
            }) : <EmptyState icon={Wallet} title="Sin presupuestos" desc="Define límites por categoría." compact />}
          </CardBody>
        </Card>
      </div>

      {/* Patrimonio + impuestos + ahorro */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader title="Patrimonio" subtitle="Lo que tienes y lo que debes" icon={Landmark} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => openNew('holding')} />} />
          <CardBody className="pt-1">
            {holdings.length ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <DonutChart data={[{ name: 'Activos', value: activos, color: 'var(--viz-1)' }, { name: 'Pasivos', value: pasivos, color: 'var(--danger)' }]} fmt={eur} height={150} inner={46} outer={68}>
                  <div>
                    <p className="text-2xs uppercase tracking-wide text-subtle">Neto</p>
                    <p className="font-display text-lg font-bold tabular text-ink">{eur(neto)}</p>
                  </div>
                </DonutChart>
                <div className="flex-1 space-y-1">
                  {holdings.map((h) => (
                    <button key={h.id} onClick={() => openEdit('holding', h)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-surface-2">
                      <Dot color={h.kind === 'liability' ? 'var(--danger)' : 'var(--viz-1)'} size={7} />
                      <span className="min-w-0 flex-1 truncate text-ink">{h.name}</span>
                      <span className={cx('tabular font-semibold', h.kind === 'liability' ? 'text-danger' : 'text-ink')}>{h.kind === 'liability' ? '−' : ''}{eur(Number(h.value))}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : <EmptyState icon={Landmark} title="Sin patrimonio" desc="Añade tus activos (cuentas, inversiones) y pasivos (deudas)." action={<Button size="sm" variant="soft" icon={Plus} onClick={() => openNew('holding')}>Añadir</Button>} compact />}
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

        <Card className="lg:col-span-3">
          <CardHeader title="Ahorro" subtitle="Toca para editar" icon={PiggyBank} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => guardedOpen('saving')} />} />
          <CardBody className="space-y-3 pt-2">
            {savings.length ? savings.map((s) => {
              const p = s.target ? Math.round((s.value / s.target) * 100) : 0
              return (
                <button key={s.id} onClick={() => openEdit('saving', s)} className="block w-full text-left">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-ink"><Dot color={s.color} size={7} /> {s.name}</span>
                    <span className="text-2xs font-semibold tabular text-muted">{p}%</span>
                  </div>
                  <ProgressBar value={p} size="sm" color={s.color} />
                </button>
              )
            }) : <EmptyState icon={PiggyBank} title="Sin objetivos" compact />}
          </CardBody>
        </Card>
      </div>

      {/* Recurrentes + clientes */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-6">
          <CardHeader title="Gastos e ingresos fijos" subtitle="Recurrentes · toca para editar" icon={Repeat} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => openNew('recurring')} />} />
          <CardBody className="space-y-1 pt-2">
            {recurring.length ? recurring.map((r) => (
              <button key={r.id} onClick={() => openEdit('recurring', r)} className={rowCls}>
                <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-md', r.amount > 0 ? 'bg-success/12 text-success' : 'bg-surface-2 text-muted')}><Repeat size={13} /></span>
                <div className="min-w-0 flex-1 text-left"><p className="truncate text-[13px] font-medium text-ink">{r.concept}</p><p className="text-2xs text-subtle">{r.day}</p></div>
                <span className={cx('text-[13px] font-semibold tabular', r.amount > 0 ? 'text-success' : 'text-ink')}>{signedEur(r.amount)}</span>
              </button>
            )) : <EmptyState icon={Repeat} title="Sin recurrentes" compact />}
          </CardBody>
        </Card>

        <Card className="lg:col-span-6">
          <CardHeader title="Clientes" subtitle={`${clients.length} cuentas · toca para editar`} icon={Users} action={<Button variant="ghost" size="icon-sm" icon={Plus} onClick={() => guardedOpen('client')} />} />
          <CardBody className="space-y-1.5 pt-2">
            {clients.length ? clients.map((cl) => (
              <button key={cl.id} onClick={() => openEdit('client', cl)} className={rowCls}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 font-display text-sm font-bold text-muted">{cl.name[0]}</span>
                <div className="min-w-0 flex-1 text-left"><p className="truncate text-[13px] font-semibold text-ink">{cl.name}</p><p className="text-2xs text-subtle">{cl.kind}</p></div>
                <div className="text-right">
                  <Badge tone={cl.status === 'Activo' ? 'success' : cl.status === 'Propuesta' ? 'warning' : 'neutral'}>{cl.status}</Badge>
                  {cl.pending > 0 && <p className="mt-1 text-2xs tabular text-warning">{eur(cl.pending)} pdte.</p>}
                </div>
              </button>
            )) : <EmptyState icon={Users} title="Sin clientes" desc="Añade tus cuentas." compact />}
          </CardBody>
        </Card>
      </div>

      {modal === 'salary' && <SalaryModal open onClose={() => setModal(null)} />}
      {cfg && (
        <RecordModal
          open
          onClose={() => setModal(null)}
          title={editingRow ? `Editar ${cfg.noun}` : cfg.title}
          table={cfg.table}
          fields={cfg.fields}
          initial={editingRow}
          onDelete={editingRow ? () => remove(cfg.table, editingRow.id) : undefined}
        />
      )}
    </PageContainer>
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
