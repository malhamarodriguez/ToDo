import { useEffect, useState } from 'react'
import { Plus, Smile, Meh, Battery, Sparkles, StickyNote, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'
import { loadFont } from '../lib/theme'
import { MOODS, COLOR_CHOICES } from '../lib/data'
import { ventureFilter, venturesOf } from '../lib/ventures'
import { VentureChips, VentureDot } from '../components/app/VentureChips'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Textarea, Badge, SectionTitle, EmptyState } from '../components/ui'
import { RecordModal } from '../components/app/RecordModal'
import { relDay, todayISO } from '../lib/utils'

const MOOD_ICONS = { enfocado: Sparkles, motivado: Smile, cansado: Battery, neutro: Meh }

export default function Diario() {
  const { journal, notes: allNotes, add, remove } = useData()
  const notes = ventureFilter(settings, allNotes, vSel)
  const { settings } = useApp()
  // Preferencias de lectura del diario (Ajustes → Módulos)
  const readStyle = {
    fontFamily: settings.journalFont === 'serif' ? "'Source Serif 4 Variable', Georgia, serif" : undefined,
    fontSize: settings.journalFont === 'serif' ? '14.5px' : undefined,
  }
  useEffect(() => {
    if (settings.journalFont === 'serif') loadFont('serif')
  }, [settings.journalFont])
  const [draft, setDraft] = useState('')
  const [draftVenture, setDraftVenture] = useState('')
  const [vSel, setVSel] = useState('todos')
  const [entryOpen, setEntryOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(null)

  const sorted = [...journal].sort((a, b) => String(b.date).localeCompare(String(a.date)))

  const addNote = async () => {
    if (!draft.trim()) return
    const color = COLOR_CHOICES[notes.length % COLOR_CHOICES.length]
    await add('notes', { text: draft.trim(), color, venture: draftVenture })
    setDraft('')
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Reflexión"
        title="Diario"
        subtitle="Cierra el día, captura ideas, ordena la cabeza."
        actions={<Button variant="primary" icon={Plus} onClick={() => setEntryOpen(true)}><span className="hidden sm:inline">Nueva entrada</span></Button>}
      />

      <VentureChips settings={settings} rows={allNotes} value={vSel} onChange={setVSel} className="mb-4" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className={settings.journalWidth === 'estrecho' ? 'mx-auto w-full max-w-xl lg:col-span-7' : 'lg:col-span-7'}>
          <SectionTitle>Entradas recientes</SectionTitle>
          {sorted.length ? (
            <div className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-line">
              {sorted.map((e) => {
                const mood = MOODS[e.mood] || MOODS.neutro
                const MoodIcon = MOOD_ICONS[e.mood] || Meh
                return (
                  <div key={e.id} className="relative pl-7">
                    <span className="absolute left-0 top-2 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-accent bg-surface" />
                    <Card hover className="group cursor-pointer" role="button" onClick={() => setEntryOpen({ row: e })}>
                      <CardBody>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-2xs font-semibold uppercase tracking-wide text-subtle">{relDay(e.date)}</span>
                          <Badge tone={mood.tone} icon={MoodIcon}>{mood.label}</Badge>
                        </div>
                        {e.title && <h3 className="text-[15px] font-semibold text-ink">{e.title}</h3>}
                        {e.body && <p className="mt-1.5 text-[13px] leading-relaxed text-muted" style={readStyle}>{e.body}</p>}
                      </CardBody>
                    </Card>
                  </div>
                )
              })}
            </div>
          ) : (
            <Card><EmptyState icon={Sparkles} title="Diario en blanco" desc="Escribe tu primera entrada para cerrar el día." action={<Button size="sm" variant="primary" icon={Plus} onClick={() => setEntryOpen(true)}>Nueva entrada</Button>} /></Card>
          )}
        </div>

        <div className="lg:col-span-5">
          <SectionTitle>Notas rápidas</SectionTitle>
          <Card className="mb-4">
            <CardBody>
              <Textarea placeholder="Anota una idea al vuelo…" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <div className="mt-2.5 flex items-center justify-end gap-2">
                <select
                  value={draftVenture}
                  onChange={(e) => setDraftVenture(e.target.value)}
                  className="h-8 rounded-lg border border-line bg-surface-2 px-2 text-2xs text-muted focus:border-accent/50 focus:outline-none"
                >
                  {venturesOf(settings).map((v) => (
                    <option key={v.id} value={v.id === 'personal' ? '' : v.id}>{v.icon} {v.name}</option>
                  ))}
                </select>
                <Button variant="soft" size="sm" icon={Plus} onClick={addNote}>Guardar nota</Button>
              </div>
            </CardBody>
          </Card>

          {notes.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {notes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNoteOpen(n)}
                  className="group relative overflow-hidden rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-line-strong"
                  style={{ borderLeft: `3px solid hsl(${n.color})` }}
                >
                  <StickyNote size={15} className="mb-2" style={{ color: `hsl(${n.color})` }} />
                  <p className="text-[13px] leading-relaxed text-ink">{n.text}</p>
                  <VentureDot settings={settings} row={n} />
                </button>
              ))}
            </div>
          ) : <p className="px-1 text-[13px] text-subtle">Tus notas aparecerán aquí.</p>}
        </div>
      </div>

      {entryOpen && (
        <RecordModal open onClose={() => setEntryOpen(false)}
          title={entryOpen.row ? 'Editar entrada' : 'Nueva entrada'}
          subtitle="¿Cómo ha ido el día?"
          table="journal"
          initial={entryOpen.row}
          onDelete={entryOpen.row ? () => remove('journal', entryOpen.row.id) : undefined}
          fields={[
            { key: 'date', label: 'Fecha', type: 'date', default: todayISO() },
            { key: 'mood', label: 'Ánimo', type: 'select', options: Object.entries(MOODS).map(([v, m]) => ({ value: v, label: m.label })) },
            { key: 'title', label: 'Título', type: 'text', full: true, placeholder: 'Un titular para hoy' },
            { key: 'body', label: 'Notas', type: 'textarea', placeholder: 'Qué pasó, qué aprendiste…' },
          ]} />
      )}
      {noteOpen && (
        <RecordModal open onClose={() => setNoteOpen(null)}
          title="Editar nota"
          table="notes"
          initial={noteOpen}
          onDelete={() => remove('notes', noteOpen.id)}
          fields={[
            { key: 'text', label: 'Nota', type: 'textarea', required: true, autoFocus: true },
            { key: 'color', label: 'Color', type: 'color' },
          ]} />
      )}
    </PageContainer>
  )
}
