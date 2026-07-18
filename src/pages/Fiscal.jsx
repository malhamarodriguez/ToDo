import { useState } from 'react'
import {
  Landmark, ChevronDown, CalendarClock, PiggyBank, Receipt, Settings2,
  History, Lock, Info,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Badge, Label, Input, Segmented, Switch, EmptyState } from '../components/ui'
import { moduleName } from '../lib/data'
import {
  fiscalSettings, computeQuarter, currentQuarter, quarterKey, quarterLabel,
  nextDeadline, unclosedQuarters, prevQuarter,
} from '../lib/fiscal'
import { eur, eur2, cx, isoShort } from '../lib/utils'

// Acordeón cerrado por defecto (ley de calma: profundidad bajo demanda)
function Acc({ icon: Icon, title, hint, children, open, onToggle }) {
  return (
    <Card>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
          <Icon size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink">{title}</span>
          {hint && <span className="block truncate text-[13px] text-muted">{hint}</span>}
        </span>
        <ChevronDown size={16} className={cx('shrink-0 text-subtle transition-transform', open && 'rotate-180')} />
      </button>
      {open && <CardBody className="pt-0">{children}</CardBody>}
    </Card>
  )
}

function Line({ label, value, strong, muted }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={muted ? 'text-subtle' : 'text-muted'}>{label}</span>
      <span className={cx('tabular', strong ? 'font-semibold text-ink' : 'text-ink')}>{value}</span>
    </div>
  )
}

export default function Fiscal() {
  const { settings, update, toast } = useApp()
  const { movements, update: updateRow } = useData()
  const [open, setOpen] = useState(null) // 'detalle' | 'historial' | 'ajustes'
  const [showMov, setShowMov] = useState(false)

  const f = fiscalSettings(settings)
  const setF = (patch) => update({ fiscal: { ...(settings.fiscal || {}), ...patch } })

  const cur = currentQuarter()
  const est = computeQuarter(movements, settings, cur)
  const dl = nextDeadline()
  const pendientes = unclosedQuarters(movements, settings)
  const closedEntries = Object.entries(f.closed || {}).sort((a, b) => b[0].localeCompare(a[0]))

  const cerrarTrimestre = (q) => {
    const snap = computeQuarter(movements, settings, q)
    setF({
      closed: {
        ...(f.closed || {}),
        [quarterKey(q)]: {
          closedAt: new Date().toISOString(),
          ingresos: snap.totalIngresos,
          gastos: snap.totalGastos,
          iva: snap.modelo303,
          irpf: snap.irpfProvision,
        },
      },
    })
    toast({ type: 'success', title: `Trimestre ${quarterLabel(q)} cerrado`, desc: 'Guardado en el historial.' })
  }

  const toggleDeducible = (m) => updateRow('movements', m.id, { deductible: !m.deductible })

  const regimeLabel =
    est.regime === 'fraccionado' ? 'Pago fraccionado (130)' : `Retención en factura (${est.retencionPct}%)`

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        eyebrow="Hacienda"
        title={moduleName(settings, 'fiscal')}
        subtitle={`Trimestre actual (${quarterLabel(cur)}) · ${regimeLabel}`}
      />

      {/* ===== Superficie: exactamente tres datos ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Protagonista */}
        <Card className="border-accent/25 sm:col-span-2">
          <CardBody className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-2xs font-medium uppercase tracking-[0.14em] text-accent">
                Tuyo de verdad
              </p>
              <p className="mt-1.5 font-display text-4xl tabular text-ink sm:text-[44px]">{eur(est.tuyo)}</p>
              <p className="mt-1 text-[13px] text-muted">
                Ingresos − gastos − provisiones − cuota de autónomos, este trimestre.
              </p>
            </div>
            <PiggyBank size={40} strokeWidth={1.5} className="text-accent/50" />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="font-mono text-2xs font-medium uppercase tracking-[0.14em] text-subtle">
              Provisionado para Hacienda
            </p>
            <p className="mt-1.5 font-display text-2xl tabular text-ink">{eur(est.provisionado)}</p>
            <p className="mt-1 text-[13px] text-muted">
              IVA {eur(est.modelo303)}{est.regime === 'fraccionado' ? ` · IRPF ${eur(est.irpfProvision)}` : ' · IRPF retenido en factura'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="font-mono text-2xs font-medium uppercase tracking-[0.14em] text-subtle">
              Próximo vencimiento
            </p>
            <p className="mt-1.5 font-display text-2xl tabular text-ink">
              {dl ? `${dl.days} días` : '—'}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
              <CalendarClock size={13} />
              {dl ? `303/130 del ${dl.label} · hasta el ${isoShort(dl.date)}` : 'Sin vencimientos'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* ===== Profundidad bajo demanda ===== */}
      <div className="mt-5 space-y-3">
        <Acc
          icon={Receipt}
          title="Este trimestre, al detalle"
          hint={`303 estimado ${eur2(est.modelo303)}${est.regime === 'fraccionado' ? ` · 130 estimado ${eur2(est.irpfProvision)}` : ''}`}
          open={open === 'detalle'}
          onToggle={() => setOpen(open === 'detalle' ? null : 'detalle')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface-2/40 p-4">
              <p className="mb-1 font-mono text-2xs font-medium uppercase tracking-wide text-subtle">Modelo 303 · IVA</p>
              <Line label={`IVA repercutido (ingresos)`} value={eur2(est.ivaRepercutido)} />
              <Line label="IVA soportado (deducibles)" value={`−${eur2(est.ivaSoportado)}`} />
              <div className="my-1.5 border-t border-line" />
              <Line label="A ingresar (estimado)" value={eur2(est.modelo303)} strong />
            </div>
            <div className="rounded-xl border border-line bg-surface-2/40 p-4">
              <p className="mb-1 font-mono text-2xs font-medium uppercase tracking-wide text-subtle">
                {est.regime === 'fraccionado' ? 'Modelo 130 · IRPF' : 'IRPF · retención en factura'}
              </p>
              {est.regime === 'fraccionado' ? (
                <>
                  <Line label={`Ingresos (${eur(est.totalIngresos)}) × IRPF`} value={eur2(est.totalIngresos * (f.irpfPct / 100))} />
                  <Line label="Menos gastos deducibles" value={`−${eur2(est.totalDeducibles * (f.irpfPct / 100))}`} />
                  <div className="my-1.5 border-t border-line" />
                  <Line label="A ingresar (estimado)" value={eur2(est.irpfProvision)} strong />
                </>
              ) : (
                <>
                  <Line label={`Retención ${est.retencionPct}% sobre ingresos`} value={eur2(est.retenido)} />
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    La ingresan tus clientes por ti: no necesitas provisionarla.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface-2/40 px-4 py-2.5">
            <span className="text-[13px] text-muted">Cuota de autónomos ({eur(f.cuota)}/mes)</span>
            <span className="text-sm font-semibold tabular text-ink">{eur(est.cuotaTrimestre)} / trimestre</span>
          </div>

          <button
            onClick={() => setShowMov((v) => !v)}
            className="mt-4 flex items-center gap-1 text-2xs font-medium text-subtle transition-colors hover:text-ink"
          >
            <ChevronDown size={13} className={cx('transition-transform', showMov && 'rotate-180')} />
            Movimientos del trimestre ({est.ingresos.length + est.gastos.length})
          </button>
          {showMov && (
            <div className="mt-2 space-y-1">
              {[...est.ingresos, ...est.gastos]
                .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                .map((m) => {
                  const gasto = Number(m.amount) < 0
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-[13px]">
                      <span className="w-12 shrink-0 font-mono text-2xs text-subtle">{isoShort(m.date)}</span>
                      <span className="min-w-0 flex-1 truncate text-ink">{m.concept}</span>
                      <span className={cx('tabular font-semibold', gasto ? 'text-danger' : 'text-success')}>
                        {gasto ? '−' : '+'}{eur(Math.abs(Number(m.amount)))}
                      </span>
                      {gasto && (
                        <label className="flex shrink-0 items-center gap-1.5 text-2xs text-subtle">
                          deducible
                          <Switch size="sm" checked={Boolean(m.deductible)} onChange={() => toggleDeducible(m)} />
                        </label>
                      )}
                    </div>
                  )
                })}
              {est.ingresos.length + est.gastos.length === 0 && (
                <p className="py-2 text-[13px] text-subtle">Sin movimientos este trimestre.</p>
              )}
              <p className="pt-1 text-2xs text-subtle">
                Convención: los ingresos se registran en base (sin IVA); los gastos, por el total pagado (IVA incluido).
              </p>
            </div>
          )}
        </Acc>

        <Acc
          icon={History}
          title="Historial de trimestres"
          hint={closedEntries.length ? `${closedEntries.length} cerrados` : 'Aún sin trimestres cerrados'}
          open={open === 'historial'}
          onToggle={() => setOpen(open === 'historial' ? null : 'historial')}
        >
          {pendientes.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {pendientes.map((q) => {
                const snap = computeQuarter(movements, settings, q)
                return (
                  <div key={quarterKey(q)} className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/30 bg-warning/[0.06] px-3.5 py-2.5">
                    <span className="text-sm font-semibold text-ink">{quarterLabel(q)}</span>
                    <span className="text-[13px] text-muted">
                      IVA {eur2(snap.modelo303)}{snap.regime === 'fraccionado' ? ` · IRPF ${eur2(snap.irpfProvision)}` : ''}
                    </span>
                    <Button variant="secondary" size="sm" icon={Lock} className="ml-auto" onClick={() => cerrarTrimestre(q)}>
                      Cerrar trimestre
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
          {closedEntries.length ? (
            <div className="space-y-1">
              {closedEntries.map(([key, c]) => (
                <div key={key} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-line bg-surface-2/40 px-3.5 py-2.5 text-[13px]">
                  <span className="font-semibold text-ink">{key.replace('-T', ' · T')}</span>
                  <span className="text-muted">Ingresos <span className="tabular text-ink">{eur(c.ingresos)}</span></span>
                  <span className="text-muted">IVA <span className="tabular text-ink">{eur2(c.iva)}</span></span>
                  <span className="text-muted">IRPF <span className="tabular text-ink">{eur2(c.irpf)}</span></span>
                  <Badge tone="success" className="ml-auto">cerrado</Badge>
                </div>
              ))}
            </div>
          ) : (
            pendientes.length === 0 && (
              <EmptyState icon={History} title="Nada que cerrar todavía" desc="Cuando acabe un trimestre con movimientos, aparecerá aquí." compact />
            )
          )}
        </Acc>

        <Acc
          icon={Settings2}
          title="Ajustes del módulo"
          hint={`IVA ${f.ivaPct}% · IRPF ${f.irpfPct}% · ${regimeLabel}`}
          open={open === 'ajustes'}
          onToggle={() => setOpen(open === 'ajustes' ? null : 'ajustes')}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Régimen de IRPF</Label>
              <Segmented
                value={f.regime}
                onChange={(regime) => setF({ regime })}
                className="w-full [&>button]:flex-1"
                options={[
                  { value: 'fraccionado', label: '130' },
                  { value: 'retencion15', label: 'Ret. 15%' },
                  { value: 'retencion7', label: 'Ret. 7%' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>IVA por defecto</Label>
                <Input type="number" min="0" max="21" value={f.ivaPct} onChange={(e) => setF({ ivaPct: Math.max(0, Math.min(21, Number(e.target.value))) })} />
              </div>
              <div>
                <Label>IRPF (130)</Label>
                <Input type="number" min="0" max="47" value={f.irpfPct} onChange={(e) => setF({ irpfPct: Math.max(0, Math.min(47, Number(e.target.value))) })} />
              </div>
            </div>
            <div>
              <Label hint="Seguridad Social, €/mes">Cuota de autónomos</Label>
              <Input type="number" min="0" step="0.01" value={f.cuota} onChange={(e) => setF({ cuota: Math.max(0, Number(e.target.value)) })} />
            </div>
            <div>
              <Label>Fecha de alta</Label>
              <Input type="date" value={f.altaDate || ''} onChange={(e) => setF({ altaDate: e.target.value })} />
            </div>
          </div>
          <div className="mt-5">
            <Label hint="afina IVA/IRPF por tipo de ingreso o gasto; vacío = el % por defecto">Porcentajes por categoría</Label>
            {(settings.financeCategories || []).length ? (
              <div className="space-y-1.5">
                {settings.financeCategories.map((c) => {
                  const r = f.rates?.[c.name] || {}
                  const setRate = (key, raw) => {
                    const val = raw === '' ? undefined : Math.max(0, Number(raw))
                    const next = { ...(f.rates || {}) }
                    next[c.name] = { ...(next[c.name] || {}) }
                    if (val === undefined) delete next[c.name][key]
                    else next[c.name][key] = val
                    if (!Object.keys(next[c.name]).length) delete next[c.name]
                    setF({ rates: next })
                  }
                  return (
                    <div key={c.name} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `hsl(${c.color})` }} />
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{c.name}</span>
                      <label className="flex items-center gap-1.5 font-mono text-2xs uppercase text-subtle">
                        IVA
                        <input
                          type="number" min="0" max="21"
                          value={r.iva ?? ''}
                          placeholder={String(f.ivaPct)}
                          onChange={(e) => setRate('iva', e.target.value)}
                          className="h-7 w-14 rounded-md border border-line bg-surface px-1.5 text-center text-[13px] text-ink focus:border-accent/50 focus:outline-none"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 font-mono text-2xs uppercase text-subtle">
                        IRPF
                        <input
                          type="number" min="0" max="47"
                          value={r.irpf ?? ''}
                          placeholder={String(f.irpfPct)}
                          onChange={(e) => setRate('irpf', e.target.value)}
                          className="h-7 w-14 rounded-md border border-line bg-surface px-1.5 text-center text-[13px] text-ink focus:border-accent/50 focus:outline-none"
                        />
                      </label>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="flex items-start gap-1.5 text-2xs leading-relaxed text-subtle">
                <Info size={12} className="mt-0.5 shrink-0" />
                Crea tus categorías en Ajustes → Finanzas y podrás afinar el IVA/IRPF de cada una aquí.
              </p>
            )}
          </div>
        </Acc>
      </div>

      {/* Disclaimer discreto y permanente */}
      <p className="mt-6 flex items-center gap-1.5 font-mono text-2xs text-subtle">
        <Landmark size={11} />
        Estimación orientativa. No sustituye a tu gestor.
      </p>
    </PageContainer>
  )
}
