// Modo demo: la app completa con datos de ejemplo, sin cuenta.
// Todo vive en localStorage; al crear cuenta se empieza limpio en la nube.
import { uid } from './utils'

export const DEMO_KEY = 'nucleo:demo'
export const isDemo = () => localStorage.getItem(DEMO_KEY) === '1'
export const enterDemo = () => localStorage.setItem(DEMO_KEY, '1')
export const exitDemo = () => {
  localStorage.removeItem(DEMO_KEY)
  localStorage.removeItem('nucleo:demo-data')
}

const d = (offset) => {
  const x = new Date()
  x.setDate(x.getDate() + offset)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}

export function demoSeed() {
  const p1 = uid(), p2 = uid(), p3 = uid()
  return {
    projects: [
      { id: p1, name: 'SaaS · Núcleo', color: '243 76% 64%' },
      { id: p2, name: 'Consultoría', color: '158 64% 44%' },
      { id: p3, name: 'Marca personal', color: '36 92% 55%' },
    ],
    tasks: [
      { id: uid(), title: 'Cerrar propuesta cliente “Alpha”', project_id: p2, priority: 'alta', status: 'doing', today: true, due: d(0), subtasks: [{ t: 'Alcance', done: true }, { t: 'Presupuesto', done: true }, { t: 'Enviar', done: false }], position: 1 },
      { id: uid(), title: 'Revisar métricas de activación', project_id: p1, priority: 'alta', status: 'todo', today: true, due: d(0), subtasks: [], position: 2 },
      { id: uid(), title: 'Guion del próximo vídeo', project_id: p3, priority: 'media', status: 'todo', today: true, due: '', subtasks: [{ t: 'Idea', done: true }, { t: 'Guion', done: false }], position: 3 },
      { id: uid(), title: 'Conciliar facturas del mes', project_id: null, priority: 'alta', status: 'todo', today: false, due: d(-2), subtasks: [], position: 4 },
      { id: uid(), title: 'Rediseñar landing de precios', project_id: p1, priority: 'media', status: 'doing', today: false, due: d(3), subtasks: [{ t: 'Copys', done: true }, { t: 'Mockup', done: false }], position: 5 },
      { id: uid(), title: 'Publicar newsletter #18', project_id: p3, priority: 'media', status: 'done', today: true, due: d(0), subtasks: [], position: 6 },
    ],
    events: [
      { id: uid(), title: 'Weekly sync · equipo', sub: 'Zoom', date: d(0), time: '10:00', duration: 'hora', color: '243 76% 64%' },
      { id: uid(), title: 'Networking', sub: 'Centro', date: d(0), time: '13:30', duration: 'manana', color: '36 92% 55%' },
      { id: uid(), title: 'Sprint v2', sub: '', date: d(2), end_date: d(4), duration: 'dias', color: '158 64% 44%' },
    ],
    goals: [
      { id: uid(), area: 'Negocio', title: 'Facturación trimestral', type: 'numeric', value: 28500, target: 40000, unit: '€' },
      { id: uid(), area: 'Finanzas', title: 'Fondo de emergencia', type: 'percent', value: 72, target: 100 },
      { id: uid(), area: 'Salud', title: 'Entrenos este mes', type: 'numeric', value: 14, target: 18, unit: '' },
      { id: uid(), area: 'Personal', title: 'Alemán B2', type: 'percent', value: 62, target: 100 },
    ],
    movements: [
      { id: uid(), concept: 'Stripe · suscripciones', category: 'Ingreso', amount: 1840, date: d(0), recurring: true },
      { id: uid(), concept: 'Cliente Alpha · retainer', category: 'Consultoría', amount: 2500, date: d(-1), recurring: true },
      { id: uid(), concept: 'Nómina', category: 'Nómina', amount: 1500, date: d(-3), recurring: true },
      { id: uid(), concept: 'Meta Ads', category: 'Marketing', amount: -640, date: d(-4) },
      { id: uid(), concept: 'Figma + Linear', category: 'Software', amount: -84, date: d(-6), recurring: true },
      { id: uid(), concept: 'Coworking', category: 'Oficina', amount: -350, date: d(-8), recurring: true },
      { id: uid(), concept: 'Cliente Volta · anticipo', category: 'Consultoría', amount: 1500, date: d(-12) },
      { id: uid(), concept: 'Curso growth', category: 'Formación', amount: -90, date: d(-15) },
    ],
    budgets: [
      { id: uid(), category: 'Marketing & ads', spent: 640, limit_amount: 1000, color: '36 92% 55%' },
      { id: uid(), category: 'Software', spent: 84, limit_amount: 150, color: '243 76% 64%' },
      { id: uid(), category: 'Comidas', spent: 210, limit_amount: 200, color: '342 80% 62%' },
    ],
    savings: [
      { id: uid(), name: 'Colchón 6 meses', value: 10800, target: 15000, color: '243 76% 64%' },
      { id: uid(), name: 'Inversión indexada', value: 6400, target: 12000, color: '158 64% 44%' },
    ],
    holdings: [
      { id: uid(), name: 'Cuenta corriente', value: 8200, kind: 'asset' },
      { id: uid(), name: 'Fondo indexado', value: 14300, kind: 'asset' },
      { id: uid(), name: 'Préstamo equipo', value: 3400, kind: 'liability' },
    ],
    clients: [
      { id: uid(), name: 'Alpha S.L.', kind: 'Retainer', monthly: 2500, status: 'Activo', pending: 0 },
      { id: uid(), name: 'Volta', kind: 'Proyecto', monthly: 1500, status: 'Activo', pending: 1500 },
      { id: uid(), name: 'Nimbus', kind: 'Propuesta', monthly: 0, status: 'Propuesta', pending: 0 },
    ],
    recurring: [
      { id: uid(), concept: 'Retainer Alpha', amount: 2500, day: 'día 1', kind: 'in' },
      { id: uid(), concept: 'Coworking', amount: -350, day: 'día 3', kind: 'out' },
    ],
    workouts: [
      { id: uid(), name: 'Empuje · Pecho', date: d(0), dur: 58, exercises: [{ name: 'Press banca', sets: '4×8', kg: 80 }, { name: 'Fondos', sets: '3×10', kg: 15 }] },
      { id: uid(), name: 'Carrera Z2', date: d(-1), dur: 35, exercises: [] },
      { id: uid(), name: 'Tirón · Espalda', date: d(-2), dur: 62, exercises: [{ name: 'Dominadas', sets: '4×8', kg: 10 }] },
      { id: uid(), name: 'Piernas', date: d(-4), dur: 55, exercises: [] },
    ],
    metrics: [
      { id: uid(), date: d(-60), weight: 80.1, fat: 18.9 },
      { id: uid(), date: d(-30), weight: 79.2, fat: 17.8 },
      { id: uid(), date: d(-7), weight: 78.6, fat: 17.1 },
      { id: uid(), date: d(0), weight: 78.4, fat: 16.9 },
    ],
    journal: [
      { id: uid(), date: d(-1), mood: 'enfocado', title: 'Buen bloque de trabajo profundo', body: 'La propuesta de Alpha quedó casi lista. Mañana, enviar y seguir con la landing.' },
      { id: uid(), date: d(-3), mood: 'motivado', title: 'Idea para el onboarding', body: 'Flujo de activación basado en "primer valor en 5 minutos".' },
    ],
    notes: [
      { id: uid(), text: 'Llamar a la gestoría por el modelo 130.', color: '36 92% 55%' },
      { id: uid(), text: 'Pedir testimonios a Alpha y Volta.', color: '243 76% 64%' },
    ],
  }
}
