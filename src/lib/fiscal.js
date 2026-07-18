// ============================================================
// Summa · Fiscal (autónomo España)
// Estimaciones de IVA (303) e IRPF (130 / retención en factura)
// a partir de los movimientos reales de Finanzas.
//
// Convención de importes (se explica en la UI):
//  - Ingresos: base imponible (sin IVA) → IVA repercutido = base × iva%
//  - Gastos: total pagado (IVA incluido) → IVA soportado = total × iva/(100+iva)
// Todo es una ESTIMACIÓN ORIENTATIVA; no sustituye a un gestor.
// ============================================================

export const FISCAL_DEFAULTS = {
  ivaPct: 21,
  irpfPct: 20, // pago fraccionado (modelo 130)
  regime: 'fraccionado', // 'fraccionado' | 'retencion15' | 'retencion7'
  cuota: 0, // cuota mensual de autónomos (€)
  altaDate: '',
  rates: {}, // { [categoría]: { iva, irpf } } — por tipo de ingreso
  closed: {}, // { '2026-T1': { closedAt, ingresos, gastos, iva, irpf } }
}

export const fiscalSettings = (settings) => ({ ...FISCAL_DEFAULTS, ...(settings?.fiscal || {}) })

// ---------- Trimestres ----------
export function quarterOf(iso) {
  const [y, m] = String(iso).slice(0, 10).split('-').map(Number)
  return { y, q: Math.ceil(m / 3) }
}
export const quarterKey = ({ y, q }) => `${y}-T${q}`
export const quarterLabel = ({ y, q }) => `${q}T ${y}`

export function currentQuarter(d = new Date()) {
  return { y: d.getFullYear(), q: Math.ceil((d.getMonth() + 1) / 3) }
}

export function quarterRange({ y, q }) {
  const m0 = (q - 1) * 3 // 0-index del primer mes
  const from = `${y}-${String(m0 + 1).padStart(2, '0')}-01`
  const last = new Date(y, m0 + 3, 0).getDate()
  const to = `${y}-${String(m0 + 3).padStart(2, '0')}-${String(last).padStart(2, '0')}`
  return { from, to }
}

export function prevQuarter({ y, q }) {
  return q === 1 ? { y: y - 1, q: 4 } : { y, q: q - 1 }
}

// ---------- Vencimientos (ventanas de presentación) ----------
// 303/130: T1 → 1–20 abr · T2 → 1–20 jul · T3 → 1–20 oct · T4 → hasta 30 ene
export function deadlineFor({ y, q }) {
  if (q === 1) return { date: `${y}-04-20`, label: `1T ${y}` }
  if (q === 2) return { date: `${y}-07-20`, label: `2T ${y}` }
  if (q === 3) return { date: `${y}-10-20`, label: `3T ${y}` }
  return { date: `${y + 1}-01-30`, label: `4T ${y}` }
}

export function nextDeadline(d = new Date()) {
  const today = d.toISOString().slice(0, 10)
  // Candidatos: el trimestre anterior (su ventana puede seguir abierta) y el actual
  const cur = currentQuarter(d)
  const candidates = [prevQuarter(cur), cur, { y: cur.q === 4 ? cur.y + 1 : cur.y, q: (cur.q % 4) + 1 }]
  for (const c of candidates) {
    const dl = deadlineFor(c)
    if (dl.date >= today) {
      const days = Math.ceil((new Date(dl.date) - d) / 86400000)
      return { ...dl, quarter: c, days }
    }
  }
  return null
}

// ---------- Cálculo de un trimestre ----------
const inQuarter = (m, range) => {
  const d = String(m.date || '').slice(0, 10)
  return d >= range.from && d <= range.to
}

export function computeQuarter(movements, settings, quarter) {
  const f = fiscalSettings(settings)
  const range = quarterRange(quarter)
  const rateFor = (m) => ({
    iva: f.rates?.[m.category]?.iva ?? f.ivaPct,
    irpf: f.rates?.[m.category]?.irpf ?? f.irpfPct,
  })

  const rows = movements.filter((m) => inQuarter(m, range))
  const ingresos = rows.filter((m) => Number(m.amount) > 0)
  const gastos = rows.filter((m) => Number(m.amount) < 0)
  const deducibles = gastos.filter((m) => m.deductible)

  const totalIngresos = ingresos.reduce((a, m) => a + Number(m.amount), 0)
  const totalGastos = gastos.reduce((a, m) => a + Math.abs(Number(m.amount)), 0)
  const totalDeducibles = deducibles.reduce((a, m) => a + Math.abs(Number(m.amount)), 0)

  // IVA
  const ivaRepercutido = ingresos.reduce((a, m) => a + Number(m.amount) * (rateFor(m).iva / 100), 0)
  const ivaSoportado = deducibles.reduce((a, m) => {
    const iva = rateFor(m).iva
    return a + Math.abs(Number(m.amount)) * (iva / (100 + iva))
  }, 0)
  const modelo303 = Math.max(0, ivaRepercutido - ivaSoportado)

  // IRPF
  const retencionPct = f.regime === 'retencion15' ? 15 : f.regime === 'retencion7' ? 7 : 0
  const retenido = (retencionPct / 100) * totalIngresos
  const rendimiento = Math.max(0, totalIngresos - totalDeducibles)
  const modelo130 = f.regime === 'fraccionado'
    ? ingresos.reduce((a, m) => a + Number(m.amount) * (rateFor(m).irpf / 100), 0) -
      deducibles.reduce((a, m) => a + Math.abs(Number(m.amount)) * (rateFor(m).irpf / 100), 0)
    : 0
  const irpfProvision = f.regime === 'fraccionado' ? Math.max(0, modelo130) : 0

  // Cuota de autónomos del trimestre completo
  const cuotaTrimestre = Number(f.cuota || 0) * 3

  const provisionado = modelo303 + irpfProvision
  const tuyo = totalIngresos - totalGastos - provisionado - cuotaTrimestre

  return {
    quarter,
    range,
    ingresos,
    gastos,
    deducibles,
    totalIngresos,
    totalGastos,
    totalDeducibles,
    ivaRepercutido,
    ivaSoportado,
    modelo303,
    irpfProvision,
    retencionPct,
    retenido,
    rendimiento,
    cuotaTrimestre,
    provisionado,
    tuyo,
    regime: f.regime,
  }
}

// Trimestres pasados sin cerrar (para el historial), del más reciente al más antiguo
export function unclosedQuarters(movements, settings, n = 8) {
  const f = fiscalSettings(settings)
  const out = []
  let c = prevQuarter(currentQuarter())
  for (let i = 0; i < n; i++) {
    const key = quarterKey(c)
    if (!f.closed?.[key]) {
      const range = quarterRange(c)
      const has = movements.some((m) => inQuarter(m, range))
      if (has) out.push(c)
    }
    c = prevQuarter(c)
  }
  return out
}
