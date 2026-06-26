import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Dot, SectionTitle } from '../components/ui'
import { RecordModal } from '../components/app/RecordModal'
import { MESES, cx, capitalize, todayISO } from '../lib/utils'

const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const pad = (n) => String(n).padStart(2, '0')

const DURATIONS = [
  { value: 'hora', label: '1 hora' },
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'dia', label: 'Todo el día' },
  { value: 'dias', label: 'Varios días' },
]

function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000) + 1
}
function durationLabel(e) {
  switch (e.duration) {
    case 'manana': return 'Mañana'
    case 'tarde': return 'Tarde'
    case 'dia': return 'Todo el día'
    case 'dias': return e.end_date ? `${daysBetween(String(e.date).slice(0, 10), String(e.end_date).slice(0, 10))} días` : 'Varios días'
    case 'hora': return e.time || '1 hora'
    default: return e.time || ''
  }
}

export default function Calendario() {
  const { events, remove } = useData()
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [selected, setSelected] = useState(today.getDate())
  const [modal, setModal] = useState(null) // 'new' | { row }

  const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const isThisMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  // Reparte cada evento por los días que ocupa (soporta varios días)
  const byDay = {}
  events.forEach((e) => {
    const start = String(e.date || '').slice(0, 10)
    if (!start) return
    let end = start
    if (e.duration === 'dias' && e.end_date) {
      const ed = String(e.end_date).slice(0, 10)
      if (ed >= start) end = ed
    }
    const d = new Date(start + 'T00:00:00')
    const endD = new Date(end + 'T00:00:00')
    let guard = 0
    while (d <= endD && guard++ < 400) {
      if (d.getFullYear() === cursor.y && d.getMonth() === cursor.m) {
        ;(byDay[d.getDate()] ||= []).push(e)
      }
      d.setDate(d.getDate() + 1)
    }
  })

  const move = (d) => {
    let m = cursor.m + d, y = cursor.y
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCursor({ y, m })
  }
  const selectedISO = `${cursor.y}-${pad(cursor.m + 1)}-${pad(selected || 1)}`
  const monthEvents = Object.entries(byDay).map(([d, evs]) => ({ d: +d, evs })).sort((a, b) => a.d - b.d)

  const EVENT_FIELDS = [
    { key: 'title', label: 'Título', type: 'text', required: true, autoFocus: true, full: true },
    { key: 'date', label: 'Fecha (inicio)', type: 'date', default: selectedISO },
    { key: 'duration', label: 'Duración', type: 'select', options: DURATIONS, default: 'hora' },
    { key: 'time', label: 'Hora', type: 'text', placeholder: '10:00', hint: 'si dura 1 hora' },
    { key: 'end_date', label: 'Fecha fin', type: 'date', hint: 'si dura varios días' },
    { key: 'sub', label: 'Detalle', type: 'text', placeholder: 'Zoom, lugar…', full: true },
    { key: 'color', label: 'Color', type: 'color' },
  ]
  const editingRow = typeof modal === 'object' && modal ? modal.row : null

  return (
    <PageContainer>
      <PageHeader eyebrow="Tiempo" title="Calendario" subtitle="Tu mes de un vistazo. Toca un evento para editarlo o borrarlo."
        actions={<Button variant="primary" icon={Plus} onClick={() => setModal('new')}><span className="hidden sm:inline">Nuevo evento</span></Button>} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">{capitalize(MESES[cursor.m])} {cursor.y}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" icon={ChevronLeft} onClick={() => move(-1)} />
              <Button variant="secondary" size="sm" onClick={() => { setCursor({ y: today.getFullYear(), m: today.getMonth() }); setSelected(today.getDate()) }}>Hoy</Button>
              <Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => move(1)} />
            </div>
          </div>
          <CardBody>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEK.map((w) => <div key={w} className="pb-2 text-center text-2xs font-semibold uppercase tracking-wide text-subtle">{w}</div>)}
              {cells.map((d, i) => {
                if (d === null) return <div key={`e${i}`} />
                const evs = byDay[d] || []
                const isToday = isThisMonth && d === today.getDate()
                const isSel = d === selected
                return (
                  <button key={d} onClick={() => setSelected(d)}
                    className={cx('group flex min-h-[68px] flex-col rounded-lg border p-1.5 text-left transition-all sm:min-h-[88px]',
                      isSel ? 'border-accent/50 bg-accent/[0.05]' : 'border-line hover:border-line-strong hover:bg-surface-2/50')}>
                    <span className={cx('mb-1 grid h-6 w-6 place-items-center rounded-full text-[13px] font-semibold tabular', isToday ? 'bg-accent text-accent-fg' : 'text-muted group-hover:text-ink')}>{d}</span>
                    <div className="space-y-1 overflow-hidden">
                      {evs.slice(0, 2).map((e, k) => (
                        <span
                          key={k}
                          role="button"
                          onClick={(ev) => { ev.stopPropagation(); setModal({ row: e }) }}
                          className="flex cursor-pointer items-center gap-1 truncate rounded px-1 py-0.5 text-2xs font-medium"
                          style={{ background: `hsl(${e.color} / 0.16)`, color: `hsl(${e.color})` }}
                        >
                          <span className="hidden truncate sm:inline">{e.title}</span>
                          <Dot color={e.color} size={6} className="sm:hidden" />
                        </span>
                      ))}
                      {evs.length > 2 && <span className="px-1 text-2xs text-subtle">+{evs.length - 2} más</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-4">
          <SectionTitle>{selected ? `${selected} de ${MESES[cursor.m]}` : 'Eventos'}</SectionTitle>
          <Card>
            <CardBody className="space-y-2">
              {(byDay[selected] || []).map((e) => (
                <button key={e.id} onClick={() => setModal({ row: e })} className="flex w-full items-center gap-3 rounded-lg bg-surface-2/50 px-3 py-2.5 text-left transition-colors hover:bg-surface-2">
                  <span className="h-9 w-0.5 shrink-0 rounded-full" style={{ background: `hsl(${e.color})` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                    <p className="flex items-center gap-1 truncate text-2xs text-subtle">
                      <Clock size={11} /> {[durationLabel(e), e.sub].filter(Boolean).join(' · ') || 'Evento'}
                    </p>
                  </div>
                </button>
              ))}
              {!(byDay[selected] || []).length && (
                <div className="py-6 text-center">
                  <p className="text-[13px] text-subtle">Sin eventos este día.</p>
                  <Button variant="ghost" size="sm" icon={Plus} className="mt-2" onClick={() => setModal('new')}>Añadir</Button>
                </div>
              )}
            </CardBody>
          </Card>

          {monthEvents.length > 0 && (
            <>
              <SectionTitle className="mt-6">Este mes</SectionTitle>
              <Card><CardBody className="space-y-1">
                {monthEvents.map(({ d, evs }) => (
                  <button key={d} onClick={() => setSelected(d)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 font-display text-sm font-bold tabular text-ink">{d}</span>
                    <div className="flex flex-wrap gap-1">
                      {evs.map((e, i) => <span key={i} className="rounded px-1.5 py-0.5 text-2xs font-medium" style={{ background: `hsl(${e.color} / 0.14)`, color: `hsl(${e.color})` }}>{e.title}</span>)}
                    </div>
                  </button>
                ))}
              </CardBody></Card>
            </>
          )}
        </div>
      </div>

      {modal && (
        <RecordModal
          open
          onClose={() => setModal(null)}
          title={editingRow ? 'Editar evento' : 'Nuevo evento'}
          subtitle="Elige cuánto dura: una hora, una mañana o varios días"
          table="events"
          fields={EVENT_FIELDS}
          initial={editingRow}
          onDelete={editingRow ? () => remove('events', editingRow.id) : undefined}
        />
      )}
    </PageContainer>
  )
}
