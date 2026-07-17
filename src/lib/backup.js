// ============================================================
// Copias de seguridad de Summa.
// La copia incluye TODO: ajustes + datos de la nube (tareas,
// finanzas, entrenos…). El import valida el esquema, enseña un
// resumen de lo que hay dentro y NUNCA sobrescribe en silencio.
// ============================================================
import { TABLES } from '../context/DataContext'

export const BACKUP_VERSION = 2

// Etiquetas legibles por tabla (para el resumen del import)
export const TABLE_LABELS = {
  projects: 'Proyectos',
  tasks: 'Tareas',
  events: 'Eventos',
  goals: 'Metas',
  movements: 'Movimientos',
  budgets: 'Presupuestos',
  savings: 'Ahorros',
  holdings: 'Patrimonio',
  clients: 'Clientes',
  recurring: 'Fijos',
  workouts: 'Entrenos',
  metrics: 'Métricas',
  journal: 'Diario',
  notes: 'Notas',
}

export function buildBackup(settings, data) {
  const tables = {}
  TABLES.forEach((t) => (tables[t] = data[t] || []))
  return {
    kind: 'summa-backup',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    tables,
  }
}

// Acepta el formato nuevo ({kind, tables}) y el antiguo (tablas en
// la raíz, sin marca). Devuelve una copia normalizada o lanza Error.
export function validateBackup(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('El archivo no es un JSON de copia válido')
  }
  const isNew = parsed.kind === 'summa-backup'
  const rawTables = isNew ? parsed.tables : parsed
  if (isNew && (!rawTables || typeof rawTables !== 'object')) {
    throw new Error('La copia no contiene datos')
  }

  const tables = {}
  let rows = 0
  for (const t of TABLES) {
    const arr = rawTables?.[t]
    if (!Array.isArray(arr)) continue
    // Solo filas con pinta de fila: objetos con id
    const clean = arr.filter((r) => r && typeof r === 'object' && r.id != null)
    tables[t] = clean
    rows += clean.length
  }

  const settings =
    parsed.settings && typeof parsed.settings === 'object' && !Array.isArray(parsed.settings)
      ? parsed.settings
      : null

  if (!settings && rows === 0) {
    throw new Error('No parece una copia de Summa: no hay ni ajustes ni datos')
  }

  return {
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : null,
    settings,
    tables,
    rows,
  }
}

// Resumen para la vista previa del import
export function summarizeBackup(backup) {
  const counts = Object.entries(backup.tables)
    .filter(([, arr]) => arr.length > 0)
    .map(([t, arr]) => ({ table: t, label: TABLE_LABELS[t] || t, count: arr.length }))
  return {
    exportedAt: backup.exportedAt,
    hasSettings: Boolean(backup.settings),
    counts,
    rows: backup.rows,
  }
}

// ¿Toca recordar la copia? (>30 días desde la última, o nunca)
export function backupOverdue(lastBackupAt, snoozedAt) {
  const DAY = 86400000
  if (snoozedAt && Date.now() - new Date(snoozedAt).getTime() < 14 * DAY) return false
  if (!lastBackupAt) return true
  return Date.now() - new Date(lastBackupAt).getTime() > 30 * DAY
}

// "hace 3 días" / "hoy" para la superficie de la tarjeta
export function agoLabel(iso) {
  if (!iso) return null
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'hoy'
  if (days === 1) return 'ayer'
  return `hace ${days} días`
}
