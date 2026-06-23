import { useState } from 'react'
import { Plus, NotebookPen, Smile, Meh, Battery, Sparkles, StickyNote } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { JOURNAL, NOTES } from '../lib/data'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Textarea, Badge, SectionTitle } from '../components/ui'
import { uid, cx } from '../lib/utils'

const MOODS = {
  enfocado: { icon: Sparkles, label: 'Enfocado', tone: 'accent' },
  motivado: { icon: Smile, label: 'Motivado', tone: 'success' },
  cansado: { icon: Battery, label: 'Cansado', tone: 'warning' },
  neutro: { icon: Meh, label: 'Neutro', tone: 'neutral' },
}

export default function Diario() {
  const { toast } = useApp()
  const [notes, setNotes] = useState(NOTES)
  const [draft, setDraft] = useState('')

  const addNote = () => {
    if (!draft.trim()) return
    const colors = ['36 92% 55%', '243 76% 64%', '158 64% 44%', '342 80% 62%']
    setNotes((n) => [{ id: uid(), text: draft.trim(), color: colors[n.length % colors.length] }, ...n])
    setDraft('')
    toast({ type: 'success', title: 'Nota guardada' })
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Reflexión"
        title="Diario"
        subtitle="Cierra el día, captura ideas, ordena la cabeza."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => toast({ type: 'success', title: 'Nueva entrada' })}>
            <span className="hidden sm:inline">Nueva entrada</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Entradas (timeline) */}
        <div className="lg:col-span-7">
          <SectionTitle>Entradas recientes</SectionTitle>
          <div className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-line">
            {JOURNAL.map((e) => {
              const mood = MOODS[e.mood] || MOODS.neutro
              const MoodIcon = mood.icon
              return (
                <div key={e.id} className="relative pl-7">
                  <span className="absolute left-0 top-2 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-accent bg-surface" />
                  <Card hover>
                    <CardBody>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-2xs font-semibold uppercase tracking-wide text-subtle">
                          {e.date}
                        </span>
                        <Badge tone={mood.tone} icon={MoodIcon}>
                          {mood.label}
                        </Badge>
                      </div>
                      <h3 className="text-[15px] font-semibold text-ink">{e.title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{e.body}</p>
                    </CardBody>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notas rápidas */}
        <div className="lg:col-span-5">
          <SectionTitle>Notas rápidas</SectionTitle>
          <Card className="mb-4">
            <CardBody>
              <Textarea
                placeholder="Anota una idea al vuelo…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="mt-2.5 flex justify-end">
                <Button variant="soft" size="sm" icon={Plus} onClick={addNote}>
                  Guardar nota
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className="relative overflow-hidden rounded-xl border border-line bg-surface p-4"
                style={{ borderLeft: `3px solid hsl(${n.color})` }}
              >
                <StickyNote size={15} className="mb-2" style={{ color: `hsl(${n.color})` }} />
                <p className="text-[13px] leading-relaxed text-ink">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
