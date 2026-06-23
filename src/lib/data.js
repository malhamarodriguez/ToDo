// Datos de ejemplo para la demo. Realistas para un autónomo
// (consultoría de marketing + un SaaS).

export const PROJECTS = [
  { id: 'saas', name: 'SaaS · Núcleo', color: '243 76% 64%' },
  { id: 'consult', name: 'Consultoría', color: '158 64% 44%' },
  { id: 'marca', name: 'Marca personal', color: '36 92% 55%' },
  { id: 'ops', name: 'Operaciones', color: '213 90% 58%' },
  { id: 'personal', name: 'Personal', color: '342 80% 62%' },
]

export const projectById = (id) => PROJECTS.find((p) => p.id === id)

export const PRIORITIES = {
  alta: { id: 'alta', label: 'Alta', hsl: '358 70% 60%' },
  media: { id: 'media', label: 'Media', hsl: '36 92% 55%' },
  baja: { id: 'baja', label: 'Baja', hsl: '213 70% 60%' },
}

// status: todo | doing | done
export const INITIAL_TASKS = [
  {
    id: 't1', title: 'Cerrar propuesta cliente “Alpha”', project: 'consult',
    priority: 'alta', status: 'doing', today: true, overdue: false, due: 'Hoy',
    subtasks: [{ t: 'Alcance', done: true }, { t: 'Presupuesto', done: true }, { t: 'Enviar', done: false }],
    tags: ['Ventas'],
  },
  {
    id: 't2', title: 'Revisar métricas de activación del SaaS', project: 'saas',
    priority: 'alta', status: 'todo', today: true, overdue: false, due: 'Hoy',
    subtasks: [{ t: 'Funnel', done: false }, { t: 'Cohorts', done: false }],
    tags: ['Producto', 'Datos'],
  },
  {
    id: 't3', title: 'Guion del próximo vídeo de marca', project: 'marca',
    priority: 'media', status: 'todo', today: true, overdue: false, due: 'Hoy',
    subtasks: [{ t: 'Idea', done: true }, { t: 'Guion', done: false }],
    tags: ['Contenido'],
  },
  {
    id: 't4', title: 'Llamada con equipo de ingeniería', project: 'saas',
    priority: 'media', status: 'todo', today: true, overdue: false, due: 'Hoy',
    subtasks: [], tags: ['Equipo'],
  },
  {
    id: 't5', title: 'Conciliar facturas de mayo', project: 'ops',
    priority: 'alta', status: 'todo', today: false, overdue: true, due: 'Atrasada',
    subtasks: [{ t: 'Stripe', done: true }, { t: 'Gastos', done: false }, { t: 'IVA', done: false }],
    tags: ['Finanzas'],
  },
  {
    id: 't6', title: 'Onboarding nuevo cliente “Volta”', project: 'consult',
    priority: 'media', status: 'doing', today: false, overdue: false, due: '25 jun',
    subtasks: [{ t: 'Kickoff', done: true }, { t: 'Accesos', done: true }, { t: 'Plan 90 días', done: false }],
    tags: ['Onboarding'],
  },
  {
    id: 't7', title: 'Rediseñar landing de precios', project: 'saas',
    priority: 'media', status: 'doing', today: false, overdue: false, due: '27 jun',
    subtasks: [{ t: 'Copys', done: true }, { t: 'Mockup', done: false }],
    tags: ['Marketing', 'Web'],
  },
  {
    id: 't8', title: 'Campaña de captación Q3', project: 'marca',
    priority: 'baja', status: 'todo', today: false, overdue: false, due: '2 jul',
    subtasks: [], tags: ['Growth'],
  },
  {
    id: 't9', title: 'Publicar newsletter #18', project: 'marca',
    priority: 'media', status: 'done', today: false, overdue: false, due: 'Ayer',
    subtasks: [{ t: 'Redactar', done: true }, { t: 'Enviar', done: true }],
    tags: ['Contenido'],
  },
  {
    id: 't10', title: 'Firmar renovación de hosting', project: 'ops',
    priority: 'baja', status: 'done', today: false, overdue: false, due: '20 jun',
    subtasks: [], tags: ['Infra'],
  },
  {
    id: 't11', title: 'Demo a inversor ángel', project: 'saas',
    priority: 'alta', status: 'done', today: false, overdue: false, due: '19 jun',
    subtasks: [{ t: 'Deck', done: true }, { t: 'Ensayo', done: true }],
    tags: ['Fundraising'],
  },
]

export const EVENTS = [
  { id: 'e1', time: '10:00', title: 'Weekly sync · Equipo', sub: 'Zoom · 45 min', color: '243 76% 64%' },
  { id: 'e2', time: '13:30', title: 'Almuerzo networking', sub: 'Celler de Can Roca', color: '36 92% 55%' },
  { id: 'e3', time: '17:00', title: 'Revisión de producto', sub: 'Google Meet', color: '158 64% 44%' },
  { id: 'e4', time: '19:30', title: 'Entreno · Empuje', sub: 'Gimnasio · 60 min', color: '342 80% 62%' },
]

export const GOALS = [
  { id: 'g1', area: 'Negocio', title: 'Facturación trimestral', type: 'numeric', value: 28500, target: 40000, unit: '€' },
  { id: 'g2', area: 'Negocio', title: 'MRR del SaaS', type: 'numeric', value: 3120, target: 5000, unit: '€' },
  { id: 'g3', area: 'Finanzas', title: 'Fondo de emergencia', type: 'percent', value: 72, target: 100 },
  { id: 'g4', area: 'Salud', title: 'Peso corporal objetivo', type: 'numeric', value: 78.4, target: 76, unit: 'kg', invert: true },
  { id: 'g5', area: 'Salud', title: 'Entrenos este mes', type: 'numeric', value: 14, target: 18, unit: '' },
  { id: 'g6', area: 'Personal', title: 'Alemán nivel B2', type: 'percent', value: 62, target: 100 },
  { id: 'g7', area: 'Negocio', title: 'Lanzar v2 del producto', type: 'project', value: 4, target: 6, unit: ' hitos' },
]

// ---------- Finanzas ----------
export const FINANCE = {
  kpis: {
    balanceMes: 2450,
    ingresosMes: 9320,
    gastosMes: 6870,
    patrimonio: 42100,
  },
  networth: [
    { m: 'Jul', activos: 31000, pasivos: 9000 },
    { m: 'Ago', activos: 32500, pasivos: 8600 },
    { m: 'Sep', activos: 33800, pasivos: 8200 },
    { m: 'Oct', activos: 35200, pasivos: 7900 },
    { m: 'Nov', activos: 36100, pasivos: 7600 },
    { m: 'Dic', activos: 38400, pasivos: 7300 },
    { m: 'Ene', activos: 39200, pasivos: 7000 },
    { m: 'Feb', activos: 40500, pasivos: 6700 },
    { m: 'Mar', activos: 41200, pasivos: 6400 },
    { m: 'Abr', activos: 43000, pasivos: 6100 },
    { m: 'May', activos: 46800, pasivos: 5900 },
    { m: 'Jun', activos: 48000, pasivos: 5900 },
  ],
  flow: [
    { m: 'Ene', ingresos: 7200, gastos: 5400 },
    { m: 'Feb', ingresos: 6800, gastos: 5100 },
    { m: 'Mar', ingresos: 9100, gastos: 6200 },
    { m: 'Abr', ingresos: 8400, gastos: 5900 },
    { m: 'May', ingresos: 10200, gastos: 6500 },
    { m: 'Jun', ingresos: 9320, gastos: 6870 },
  ],
  budgets: [
    { cat: 'Software & herramientas', spent: 420, limit: 600, color: '243 76% 64%' },
    { cat: 'Marketing & ads', spent: 1280, limit: 1500, color: '36 92% 55%' },
    { cat: 'Oficina & coworking', spent: 350, limit: 350, color: '358 70% 60%' },
    { cat: 'Formación', spent: 90, limit: 300, color: '158 64% 44%' },
    { cat: 'Comidas & dietas', spent: 540, limit: 500, color: '342 80% 62%' },
  ],
  savings: [
    { id: 's1', name: 'Colchón 6 meses', value: 10800, target: 15000, color: '243 76% 64%' },
    { id: 's2', name: 'Inversión indexada', value: 6400, target: 12000, color: '158 64% 44%' },
    { id: 's3', name: 'Equipo & setup', value: 1500, target: 3000, color: '36 92% 55%' },
  ],
  assets: [
    { name: 'Cuenta corriente', value: 8200 },
    { name: 'Cuenta ahorro', value: 10800 },
    { name: 'Fondo indexado', value: 14300 },
    { name: 'Cripto', value: 3200 },
    { name: 'Equipo & material', value: 6400 },
    { name: 'Por cobrar (clientes)', value: 5100 },
  ],
  liabilities: [
    { name: 'Préstamo equipo', value: 3400 },
    { name: 'Tarjeta de crédito', value: 1200 },
    { name: 'IVA a liquidar', value: 1300 },
  ],
  movements: [
    { id: 'm1', concept: 'Stripe · Suscripciones SaaS', cat: 'Ingreso', date: 'Hoy', amount: 1840, recurring: true },
    { id: 'm2', concept: 'Cliente Alpha · Retainer', cat: 'Consultoría', date: 'Ayer', amount: 2500, recurring: true },
    { id: 'm3', concept: 'Meta Ads', cat: 'Marketing', date: '21 jun', amount: -640, recurring: false },
    { id: 'm4', concept: 'Figma + Linear', cat: 'Software', date: '20 jun', amount: -84, recurring: true },
    { id: 'm5', concept: 'Coworking Aticco', cat: 'Oficina', date: '18 jun', amount: -350, recurring: true },
    { id: 'm6', concept: 'Curso growth avanzado', cat: 'Formación', date: '15 jun', amount: -90, recurring: false },
    { id: 'm7', concept: 'Cliente Volta · Anticipo', cat: 'Consultoría', date: '14 jun', amount: 1500, recurring: false },
  ],
  recurring: [
    { id: 'r1', concept: 'Retainer Alpha', amount: 2500, day: 'día 1', kind: 'in' },
    { id: 'r2', concept: 'Suscripciones SaaS', amount: 1840, day: 'continuo', kind: 'in' },
    { id: 'r3', concept: 'Coworking', amount: -350, day: 'día 3', kind: 'out' },
    { id: 'r4', concept: 'Software stack', amount: -84, day: 'día 5', kind: 'out' },
    { id: 'r5', concept: 'Gestoría', amount: -120, day: 'día 10', kind: 'out' },
  ],
  clients: [
    { id: 'c1', name: 'Alpha S.L.', kind: 'Retainer', monthly: 2500, status: 'Activo', pending: 0 },
    { id: 'c2', name: 'Volta', kind: 'Proyecto', monthly: 1500, status: 'Activo', pending: 1500 },
    { id: 'c3', name: 'Nimbus', kind: 'Proyecto', monthly: 0, status: 'Propuesta', pending: 0 },
    { id: 'c4', name: 'Faro Studio', kind: 'Hora', monthly: 900, status: 'Activo', pending: 600 },
  ],
  tax: {
    ingresosTrim: 27600,
    gastosTrim: 12400,
    ivaRepercutido: 5796,
    ivaSoportado: 2604,
    irpfRetenido: 4140,
  },
}

// ---------- Deporte ----------
export function makeStreak(days = 364, seed = 7) {
  // Genera una rejilla tipo "contribuciones" determinista.
  let s = seed
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  const out = []
  for (let i = days; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    let p = 0.55
    if (dow === 0) p = 0.2 // descanso domingos
    if (dow === 6) p = 0.35
    const r = rnd()
    const level = r > p ? Math.min(4, 1 + Math.floor(rnd() * 4)) : 0
    out.push({ date: d, level })
  }
  return out
}

export const WORKOUTS = [
  {
    id: 'w1', date: 'Hoy', name: 'Empuje · Pecho/Tríceps', dur: 58, vol: 6420,
    ex: [
      { name: 'Press banca', sets: '4×8', kg: 80 },
      { name: 'Press inclinado mancuerna', sets: '3×10', kg: 28 },
      { name: 'Fondos lastrados', sets: '3×10', kg: 15 },
      { name: 'Extensión tríceps polea', sets: '3×12', kg: 30 },
    ],
  },
  {
    id: 'w2', date: 'Ayer', name: 'Carrera continua', dur: 35, vol: 0,
    ex: [{ name: '6,2 km · 5:38/km', sets: 'Z2', kg: 0 }],
  },
  {
    id: 'w3', date: 'Lun', name: 'Tirón · Espalda/Bíceps', dur: 62, vol: 7100,
    ex: [
      { name: 'Dominadas', sets: '4×8', kg: 10 },
      { name: 'Remo con barra', sets: '4×10', kg: 70 },
      { name: 'Curl bíceps', sets: '3×12', kg: 16 },
    ],
  },
]

export const BODY_METRICS = [
  { m: 'Ene', peso: 81.2, grasa: 19.5 },
  { m: 'Feb', peso: 80.4, grasa: 18.8 },
  { m: 'Mar', peso: 79.9, grasa: 18.2 },
  { m: 'Abr', peso: 79.1, grasa: 17.6 },
  { m: 'May', peso: 78.6, grasa: 17.1 },
  { m: 'Jun', peso: 78.4, grasa: 16.8 },
]

export const ACHIEVEMENTS = [
  { id: 'a1', name: 'Racha de 30 días', icon: 'flame', got: true },
  { id: 'a2', name: '100 entrenos', icon: 'dumbbell', got: true },
  { id: 'a3', name: 'Press banca 80 kg', icon: 'trophy', got: true },
  { id: 'a4', name: '5 km < 25 min', icon: 'timer', got: true },
  { id: 'a5', name: 'Racha de 60 días', icon: 'flame', got: false },
  { id: 'a6', name: '10 km continuos', icon: 'medal', got: false },
]

// ---------- Diario ----------
export const JOURNAL = [
  {
    id: 'j1', date: '23 jun', mood: 'enfocado',
    title: 'Foco en cerrar Alpha',
    body: 'Buen bloque de trabajo profundo por la mañana. La propuesta de Alpha quedó al 80%. Me distraje con notificaciones después de comer — mañana móvil en otra habitación.',
  },
  {
    id: 'j2', date: '22 jun', mood: 'cansado',
    title: 'Día de operaciones',
    body: 'Mucho admin: facturas, IVA, correos. Poco creativo pero necesario. El entreno de tirón salió fuerte.',
  },
  {
    id: 'j3', date: '21 jun', mood: 'motivado',
    title: 'Idea para el onboarding',
    body: 'Se me ocurrió un flujo de activación para el SaaS basado en “primer valor en 5 minutos”. Apuntado para validar con datos.',
  },
]

export const NOTES = [
  { id: 'n1', text: 'Llamar a la gestoría sobre el modelo 130.', color: '36 92% 55%' },
  { id: 'n2', text: 'Idea: webinar mensual para leads de consultoría.', color: '243 76% 64%' },
  { id: 'n3', text: 'Leer “The Mom Test” antes de las entrevistas.', color: '158 64% 44%' },
  { id: 'n4', text: 'Pedir testimonios a Alpha y Faro.', color: '342 80% 62%' },
]

// ---------- Calendario ----------
export const CAL_EVENTS = {
  3: [{ t: 'Cierre mes', c: '358 70% 60%' }],
  9: [{ t: 'Webinar', c: '243 76% 64%' }],
  12: [{ t: 'Demo Volta', c: '158 64% 44%' }],
  18: [{ t: 'Coworking', c: '213 90% 58%' }],
  23: [
    { t: 'Sync equipo', c: '243 76% 64%' },
    { t: 'Networking', c: '36 92% 55%' },
    { t: 'Entreno', c: '342 80% 62%' },
  ],
  24: [{ t: 'Demo inversor', c: '358 70% 60%' }],
  27: [{ t: 'Deadline landing', c: '36 92% 55%' }],
}

export const MODULES = [
  { id: 'inicio', name: 'Inicio', icon: 'Home' },
  { id: 'negocio', name: 'Negocio', icon: 'Briefcase' },
  { id: 'finanzas', name: 'Finanzas', icon: 'Wallet' },
  { id: 'deporte', name: 'Deporte', icon: 'Dumbbell' },
  { id: 'metas', name: 'Metas', icon: 'Target' },
  { id: 'diario', name: 'Diario', icon: 'NotebookPen' },
  { id: 'calendario', name: 'Calendario', icon: 'Calendar' },
]
