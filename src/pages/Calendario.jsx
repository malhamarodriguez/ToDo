import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CAL_EVENTS } from '../lib/data'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Dot, SectionTitle } from '../components/ui'
import { MESES, cx, capitalize } from '../lib/utils'

const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Calendario() {
  const { toast } = useApp()
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState(today.getDate())

  const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7 // lunes = 0
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const isThisMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth()

  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const move = (d) => {
    let m = cursor.m + d
    let y = cursor.y
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCursor({ y, m })
  }

  const upcoming = Object.entries(CAL_EVENTS)
    .map(([d, evs]) => ({ d: +d, evs }))
    .sort((a, b) => a.d - b.d)

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Tiempo"
        title="Calendario"
        subtitle="Tu mes de un vistazo."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => toast({ type: 'success', title: 'Nuevo evento' })}>
            <span className="hidden sm:inline">Nuevo evento</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">
              {capitalize(MESES[cursor.m])} {cursor.y}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" icon={ChevronLeft} onClick={() => move(-1)} />
              <Button variant="secondary" size="sm" onClick={() => { setCursor({ y: today.getFullYear(), m: today.getMonth() }); setSelected(today.getDate()) }}>
                Hoy
              </Button>
              <Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => move(1)} />
            </div>
          </div>
          <CardBody>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK.map((w) => (
                <div key={w} className="pb-2 text-center text-2xs font-semibold uppercase tracking-wide text-subtle">
                  {w}
                </div>
              ))}
              {cells.map((d, i) => {
                if (d === null) return <div key={`e${i}`} />
                const evs = CAL_EVENTS[d] || []
                const isToday = isThisMonth && d === today.getDate()
                const isSel = d === selected
                return (
                  <button
                    key={d}
                    onClick={() => setSelected(d)}
                    className={cx(
                      'group flex min-h-[68px] flex-col rounded-lg border p-1.5 text-left transition-all sm:min-h-[88px]',
                      isSel ? 'border-accent/50 bg-accent/[0.05]' : 'border-line hover:border-line-strong hover:bg-surface-2/50'
                    )}
                  >
                    <span
                      className={cx(
                        'mb-1 grid h-6 w-6 place-items-center rounded-full text-[13px] font-semibold tabular',
                        isToday ? 'bg-accent text-accent-fg' : 'text-muted group-hover:text-ink'
                      )}
                    >
                      {d}
                    </span>
                    <div className="space-y-1 overflow-hidden">
                      {evs.slice(0, 2).map((e, k) => (
                        <span
                          key={k}
                          className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-2xs font-medium"
                          style={{ background: `hsl(${e.c} / 0.14)`, color: `hsl(${e.c})` }}
                        >
                          <span className="hidden truncate sm:inline">{e.t}</span>
                          <Dot color={e.c} size={6} className="sm:hidden" />
                        </span>
                      ))}
                      {evs.length > 2 && (
                        <span className="px-1 text-2xs text-subtle">+{evs.length - 2} más</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Panel lateral */}
        <div className="lg:col-span-4">
          <SectionTitle>
            {selected ? `${selected} de ${MESES[cursor.m]}` : 'Próximos eventos'}
          </SectionTitle>
          <Card>
            <CardBody className="space-y-2">
              {(CAL_EVENTS[selected]?.length ? CAL_EVENTS[selected] : []).map((e, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-surface-2/50 px-3 py-2.5">
                  <span className="h-8 w-0.5 rounded-full" style={{ background: `hsl(${e.c})` }} />
                  <span className="text-sm font-medium text-ink">{e.t}</span>
                </div>
              ))}
              {!CAL_EVENTS[selected]?.length && (
                <p className="py-6 text-center text-[13px] text-subtle">Sin eventos este día.</p>
              )}
            </CardBody>
          </Card>

          <SectionTitle className="mt-6">Este mes</SectionTitle>
          <Card>
            <CardBody className="space-y-1">
              {upcoming.map(({ d, evs }) => (
                <button
                  key={d}
                  onClick={() => setSelected(d)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 font-display text-sm font-bold tabular text-ink">
                    {d}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {evs.map((e, i) => (
                      <span
                        key={i}
                        className="rounded px-1.5 py-0.5 text-2xs font-medium"
                        style={{ background: `hsl(${e.c} / 0.14)`, color: `hsl(${e.c})` }}
                      >
                        {e.t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
