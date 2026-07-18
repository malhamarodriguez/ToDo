import { ArrowRight, CheckSquare, Landmark, Dumbbell, Target, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer } from '../components/layout/Page'
import { Card, CardBody } from '../components/ui'
import { moduleName } from '../lib/data'
import { nextDeadline } from '../lib/fiscal'
import { renderGreeting, longDate, capitalize, todayISO, taskToday, taskOverdue, clamp, cx } from '../lib/utils'

// Vista "Hoy": aterrizaje minimalista. Máximo 4 tarjetas de 1-3 líneas
// con su enlace — sin gráficos, sin tablas, sin números secundarios.
function goalPct(g) {
  if (g.type === 'percent') return Math.round(g.value)
  if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
  return clamp(Math.round((g.value / Math.max(g.target, 1)) * 100), 0, 100)
}

function HoyCard({ icon: Icon, title, lines, to, toLabel, navigate, done }) {
  return (
    <Card hover className="cursor-pointer" role="button" onClick={() => navigate(to)}>
      <CardBody className="flex items-start gap-4">
        <span
          className={cx(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
            done ? 'bg-accent text-accent-fg' : 'bg-accent/12 text-accent'
          )}
        >
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {lines.filter(Boolean).slice(0, 2).map((l, i) => (
            <p key={i} className="mt-0.5 truncate text-[13px] text-muted">{l}</p>
          ))}
        </div>
        <span className="mt-1 flex shrink-0 items-center gap-1 text-2xs font-medium text-subtle">
          {toLabel} <ArrowRight size={12} />
        </span>
      </CardBody>
    </Card>
  )
}

export default function Hoy() {
  const { settings, navigate } = useApp()
  const { tasks, workouts, goals } = useData()

  const visible = (id) => !(settings.modules || []).find((m) => m.id === id)?.hidden
  const nombre = (id) => moduleName(settings, id)

  const todays = tasks.filter((t) => (taskToday(t) || taskOverdue(t)) && t.status !== 'done')
  const dl = nextDeadline()
  const entrenoHoy = workouts.some((w) => String(w.date).slice(0, 10) === todayISO())
  const goal = goals.find((g) => goalPct(g) < 100) || goals[0]

  const cards = [
    visible('negocio') && {
      icon: CheckSquare,
      title: todays.length
        ? `${todays.length} ${todays.length === 1 ? 'tarea' : 'tareas'} para hoy`
        : 'Nada pendiente hoy',
      lines: todays.length ? todays.slice(0, 2).map((t) => t.title) : ['Día despejado — o crea una con ⌘K.'],
      to: 'negocio',
      toLabel: nombre('negocio'),
    },
    visible('fiscal') &&
      dl && {
        icon: Landmark,
        title: `Hacienda en ${dl.days} ${dl.days === 1 ? 'día' : 'días'}`,
        lines: [`Modelos 303/130 del ${dl.label}.`],
        to: 'fiscal',
        toLabel: nombre('fiscal'),
      },
    visible('deporte') && {
      icon: entrenoHoy ? Check : Dumbbell,
      done: entrenoHoy,
      title: entrenoHoy ? 'Entreno hecho · ¡bien!' : 'Entreno del día',
      lines: [entrenoHoy ? 'Constancia que suma.' : 'Aún sin marcar.'],
      to: 'deporte',
      toLabel: nombre('deporte'),
    },
    visible('metas') &&
      goal && {
        icon: Target,
        title: goal.title,
        lines: [`${goalPct(goal)}% — sigue empujando.`],
        to: 'metas',
        toLabel: nombre('metas'),
      },
  ]
    .filter(Boolean)
    .slice(0, 4)

  return (
    <PageContainer className="max-w-2xl">
      <div className="pt-6 sm:pt-10">
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl animate-fade-up">
          {renderGreeting(settings.greeting, settings.name)}
        </h1>
        <p className="mt-2 text-sm text-muted animate-fade-up" style={{ animationDelay: '40ms' }}>
          {capitalize(longDate())}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {cards.map((c, i) => (
          <div key={c.to + c.title} className="animate-fade-up" style={{ animationDelay: `${80 + i * 50}ms` }}>
            <HoyCard {...c} navigate={navigate} />
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('inicio')}
        className="mt-8 flex items-center gap-1.5 text-[13px] font-medium text-subtle transition-colors hover:text-accent animate-fade-up"
        style={{ animationDelay: '300ms' }}
      >
        Ver el panel completo <ArrowRight size={13} />
      </button>
    </PageContainer>
  )
}
