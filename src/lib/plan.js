// Planes del producto.
// Free: lo esencial sin límite de tareas; topes suaves en colecciones "pro".
// Pro: todo ilimitado (y futuras: informes, IA, banco).
export const FREE_LIMITS = {
  projects: 3,
  clients: 3,
  goals: 5,
  budgets: 3,
  savings: 2,
}

export const PLAN_COPY = {
  free: { name: 'Gratis', desc: 'Para organizarte a diario' },
  pro: { name: 'Pro', desc: 'Para dirigir tu negocio' },
}

export const PRO_FEATURES = [
  'Proyectos, clientes, metas y presupuestos ilimitados',
  'Copia de seguridad completa y exportación',
  'Acceso anticipado: informes mensuales, plantillas y recurrentes',
  'Próximamente: asistente IA y conexión bancaria',
  'Soporte prioritario',
]

export const PRO_PRICE = { monthly: '4,99 €', yearly: '49 €' }

export function canCreate(kind, count, isPro) {
  if (isPro) return true
  const limit = FREE_LIMITS[kind]
  return limit == null || count < limit
}
