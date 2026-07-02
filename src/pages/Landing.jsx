import {
  ArrowRight, Check, Sparkles, LayoutDashboard, Wallet, Dumbbell, Target,
  CalendarDays, NotebookPen, ShieldCheck, Zap, Smartphone, Play, Columns3,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Logo, Mark } from '../components/layout/Logo'
import { Button, Badge } from '../components/ui'
import { FREE_LIMITS, PRO_PRICE } from '../lib/plan'
import { enterDemo } from '../lib/demo'
import { cx } from '../lib/utils'

const startDemo = () => {
  enterDemo()
  location.hash = '#/inicio'
  location.reload()
}

function Nav({ navigate }) {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Logo onClick={() => navigate('')} />
      <div className="flex items-center gap-2.5">
        <Button variant="ghost" onClick={() => navigate('acceso')}>Entrar</Button>
        <Button variant="primary" onClick={() => navigate('acceso')}>Empezar gratis</Button>
      </div>
    </nav>
  )
}

// Mini-mockup del panel, en puro CSS (ligero y siempre a juego con el tema)
function HeroMock() {
  return (
    <div className="relative mx-auto mt-14 max-w-4xl">
      <div className="absolute -inset-8 -z-10 rounded-[40px] bg-accent/10 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-line bg-surface-2/60 px-4 py-2.5">
          {['bg-danger/70', 'bg-warning/70', 'bg-success/70'].map((c) => (
            <span key={c} className={cx('h-2.5 w-2.5 rounded-full', c)} />
          ))}
          <span className="mx-auto rounded-md bg-surface px-8 py-0.5 text-2xs text-subtle">nucleo — centro de mando</span>
        </div>
        <div className="grid grid-cols-12 gap-3 p-4 sm:p-5">
          <div className="col-span-3 hidden space-y-2 sm:block">
            {['Inicio', 'Negocio', 'Finanzas', 'Deporte', 'Metas'].map((m, i) => (
              <div key={m} className={cx('rounded-lg px-3 py-2 text-2xs font-medium', i === 0 ? 'bg-accent/14 text-accent' : 'text-muted')}>{m}</div>
            ))}
          </div>
          <div className="col-span-12 space-y-3 sm:col-span-9">
            <div className="h-4 w-48 rounded bg-ink/10" />
            <div className="grid grid-cols-3 gap-3">
              {[68, 42, 85].map((v, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface-2/50 p-3">
                  <div className="h-2 w-12 rounded bg-ink/10" />
                  <div className="mt-2 h-3 w-16 rounded bg-ink/20" />
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5">
                <span className={cx('grid h-4.5 w-4.5 h-5 w-5 place-items-center rounded-md border', i === 1 ? 'border-accent bg-accent text-accent-fg' : 'border-line-strong')}>
                  {i === 1 && <Check size={11} strokeWidth={3} />}
                </span>
                <div className={cx('h-2.5 rounded bg-ink/15', i === 1 ? 'w-40 opacity-40' : i === 2 ? 'w-56' : 'w-48')} />
                <span className="ml-auto h-4 w-10 rounded-full bg-accent/14" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: LayoutDashboard, t: 'Un inicio con foco', d: 'Tus tareas de hoy, agenda, entreno y balance en una sola pantalla. Sabes qué toca sin pensar.' },
  { icon: Columns3, t: 'Negocio en Kanban', d: 'Lista y tablero con arrastrar y soltar, proyectos con color, subtareas y fechas límite.' },
  { icon: Wallet, t: 'Finanzas de autónomo', d: 'Nómina, ingresos y gastos, presupuestos, patrimonio y un estimador de impuestos.' },
  { icon: Dumbbell, t: 'Deporte con rachas', d: 'Tu constancia tipo GitHub, entrenos, peso corporal y logros que se desbloquean solos.' },
  { icon: Target, t: 'Metas por áreas', d: 'Negocio, finanzas, salud y personal, con progreso visual que empuja.' },
  { icon: CalendarDays, t: 'Calendario + diario', d: 'Eventos con duración real y un diario para cerrar el día con claridad.' },
]

const TRUST = [
  { icon: Zap, t: 'Instantáneo', d: 'PWA instalable: abre al momento desde tu pantalla de inicio.' },
  { icon: Smartphone, t: 'Multi-dispositivo', d: 'Misma información en móvil y ordenador, sincronizada.' },
  { icon: ShieldCheck, t: 'Tus datos, tuyos', d: 'Cifrado en tránsito, aislamiento por usuario y exportación completa.' },
]

function Pricing({ navigate }) {
  return (
    <section className="mx-auto max-w-4xl px-5 py-20">
      <h2 className="text-center font-display text-3xl font-bold tracking-tight text-ink">Precios simples</h2>
      <p className="mx-auto mt-2 max-w-md text-center text-muted">Empieza gratis para siempre. Pásate a Pro cuando tu negocio te lo pida.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="font-display text-lg font-bold text-ink">Gratis</h3>
          <p className="mt-1 text-[13px] text-muted">Para organizarte a diario</p>
          <p className="mt-4 font-display text-4xl font-bold text-ink">0 €</p>
          <ul className="mt-5 space-y-2.5 text-sm text-muted">
            {['Tareas y calendario ilimitados', `Hasta ${FREE_LIMITS.projects} proyectos y ${FREE_LIMITS.clients} clientes`, 'Finanzas, deporte, metas y diario', 'Sincronización multi-dispositivo'].map((f) => (
              <li key={f} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-success" />{f}</li>
            ))}
          </ul>
          <Button variant="secondary" className="mt-6 w-full" onClick={() => navigate('acceso')}>Crear cuenta</Button>
        </div>
        <div className="relative rounded-2xl border border-accent/40 bg-surface p-6 shadow-glow">
          <Badge tone="accent" className="absolute -top-2.5 right-5">Recomendado</Badge>
          <h3 className="font-display text-lg font-bold text-ink">Pro</h3>
          <p className="mt-1 text-[13px] text-muted">Para dirigir tu negocio</p>
          <p className="mt-4 font-display text-4xl font-bold text-ink">{PRO_PRICE.monthly}<span className="text-base font-medium text-muted"> /mes</span></p>
          <p className="text-2xs text-subtle">o {PRO_PRICE.yearly}/año · 14 días de prueba</p>
          <ul className="mt-5 space-y-2.5 text-sm text-muted">
            {['Todo lo del plan Gratis, sin límites', 'Proyectos, clientes y presupuestos ilimitados', 'Informes y plantillas (acceso anticipado)', 'Próximamente: IA y conexión bancaria'].map((f) => (
              <li key={f} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-accent" />{f}</li>
            ))}
          </ul>
          <Button variant="primary" icon={Sparkles} className="mt-6 w-full" onClick={() => navigate('acceso')}>Empezar prueba</Button>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const { navigate } = useApp()
  return (
    <div className="app-canvas min-h-[100dvh] text-ink">
      <Nav navigate={navigate} />

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-5 pt-14 text-center sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-accent">
          <Sparkles size={13} /> Tu centro de mando personal
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl">
          Negocio, dinero y vida.<br />
          <span className="text-accent">Todo bajo control.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Núcleo une tus tareas, finanzas, entrenos y metas en un panel rápido y
          precioso. Hecho para autónomos y emprendedores que lo quieren todo en un sitio.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" size="lg" iconRight={ArrowRight} onClick={() => navigate('acceso')}>
            Empezar gratis
          </Button>
          <Button variant="secondary" size="lg" icon={Play} onClick={startDemo}>
            Probar la demo
          </Button>
        </div>
        <p className="mt-3 text-2xs text-subtle">Sin tarjeta · La demo no necesita cuenta</p>
        <HeroMock />
      </header>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight text-ink">Ocho módulos. Cero pestañas.</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-muted">Deja de saltar entre cinco apps: aquí vive todo lo que gestionas.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/12 text-accent">
                <f.icon size={19} />
              </span>
              <h3 className="mt-3.5 text-[15px] font-semibold text-ink">{f.t}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {TRUST.map((f) => (
            <div key={f.t} className="flex items-start gap-3 rounded-xl border border-line bg-surface-2/40 p-4">
              <f.icon size={18} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-ink">{f.t}</p>
                <p className="mt-0.5 text-[13px] text-muted">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Pricing navigate={navigate} />

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <div className="rounded-3xl border border-accent/25 bg-accent/[0.06] px-6 py-12">
          <Mark size={40} />
          <h2 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">Tu vida cabe en un panel.</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted">Pruébalo ahora mismo — la demo se abre en un clic.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="primary" size="lg" onClick={() => navigate('acceso')}>Crear cuenta gratis</Button>
            <Button variant="ghost" size="lg" onClick={startDemo}>Ver la demo →</Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-[13px] text-subtle">
          <span className="flex items-center gap-2"><Mark size={18} /> © {new Date().getFullYear()} Núcleo</span>
          <div className="flex gap-5">
            <button onClick={() => navigate('privacidad')} className="transition-colors hover:text-ink">Privacidad</button>
            <button onClick={() => navigate('terminos')} className="transition-colors hover:text-ink">Términos</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ---------- Páginas legales (simples y honestas) ----------
export function Legal({ page }) {
  const { navigate } = useApp()
  const isPriv = page === 'privacidad'
  return (
    <div className="app-canvas min-h-[100dvh] text-ink">
      <Nav navigate={navigate} />
      <main className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="font-display text-3xl font-bold text-ink">{isPriv ? 'Privacidad' : 'Términos de uso'}</h1>
        <div className="prose-sm mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
          {isPriv ? (
            <>
              <p><strong className="text-ink">Tus datos son tuyos.</strong> Núcleo guarda la información que introduces (tareas, finanzas, entrenos, notas) en una base de datos con aislamiento por usuario: solo tu cuenta puede leer tus filas.</p>
              <p>Usamos tu email únicamente para autenticarte. No vendemos datos, no hay publicidad y no compartimos información con terceros.</p>
              <p>Puedes exportar una copia completa de tus datos desde Ajustes en cualquier momento, y solicitar el borrado total de tu cuenta.</p>
              <p>La demo funciona solo en tu navegador y no envía nada a nuestros servidores.</p>
            </>
          ) : (
            <>
              <p>Núcleo se ofrece «tal cual», con un plan gratuito y un plan Pro de pago. Puedes cancelar el plan Pro en cualquier momento y seguirás teniendo acceso hasta el final del periodo pagado.</p>
              <p>Eres responsable del contenido que guardas. No uses el servicio para actividades ilegales.</p>
              <p>Hacemos copias de seguridad razonables, pero te recomendamos exportar tus datos periódicamente desde Ajustes.</p>
              <p>Podemos actualizar estas condiciones; si el cambio es relevante, lo verás anunciado en la app.</p>
            </>
          )}
        </div>
        <Button variant="secondary" className="mt-10" onClick={() => navigate('')}>← Volver</Button>
      </main>
    </div>
  )
}
