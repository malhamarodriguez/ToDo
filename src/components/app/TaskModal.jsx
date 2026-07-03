import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Repeat } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { PRIORITIES } from '../../lib/data'
import { todayISO, cx } from '../../lib/utils'
import { parseTask, RECUR_OPTIONS, getRecur, withRecur } from '../../lib/nlp'
import { Modal, Button, Label, Input, Select, Checkbox, Segmented } from '../ui'

export function TaskModal() {
  const { taskModal, setTaskModal, toast } = useApp()
  const { projects, add, update, remove } = useData()
  const editing = taskModal?.mode === 'edit' ? taskModal.task : null

  const [title, setTitle] = useState('')
  const [project, setProject] = useState('')
  const [priority, setPriority] = useState('media')
  const [due, setDue] = useState('')
  const [today, setToday] = useState(true)
  const [subtasks, setSubtasks] = useState([])
  const [subDraft, setSubDraft] = useState('')
  const [recur, setRecur] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!taskModal) return
    setTitle(editing?.title || '')
    setProject(editing?.project_id || '')
    setPriority(editing?.priority || 'media')
    setDue(/^\d{4}-\d{2}-\d{2}$/.test(editing?.due || '') ? editing.due : '')
    setToday(editing ? Boolean(editing.today) : true)
    setSubtasks(editing?.subtasks || [])
    setRecur(editing ? getRecur(editing) : '')
    setSubDraft('')
  }, [taskModal]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lenguaje natural en vivo: "mañana !alta #proyecto"
  const nlp = useMemo(() => parseTask(title, projects), [title, projects])

  if (!taskModal) return null
  const close = () => setTaskModal(null)

  const addSub = () => {
    if (!subDraft.trim()) return
    setSubtasks((s) => [...s, { t: subDraft.trim(), done: false }])
    setSubDraft('')
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    const payload = {
      title: (nlp.chips.length ? nlp.title : title).trim(),
      project_id: project || nlp.projectId || null,
      priority: nlp.priority || priority,
      due: due || nlp.due || '',
      today: today || nlp.due === todayISO(),
      subtasks,
      tags: withRecur(editing?.tags, recur),
    }
    if (editing) {
      await update('tasks', editing.id, payload)
      toast({ type: 'success', title: 'Tarea actualizada' })
    } else {
      const row = await add('tasks', { ...payload, status: 'todo', position: -Date.now() })
      if (row) toast({ type: 'success', title: 'Tarea creada', desc: title.trim() })
    }
    setBusy(false)
    close()
  }

  return (
    <Modal
      open
      onClose={close}
      title={editing ? 'Editar tarea' : 'Nueva tarea'}
      subtitle={editing ? 'Ajusta lo que necesites' : 'Captura rápida — añádela a tu flujo'}
      footer={
        <>
          {editing && (
            <Button
              variant="danger"
              className="mr-auto"
              onClick={() => {
                remove('tasks', editing.id)
                close()
              }}
            >
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button variant="primary" onClick={submit} disabled={busy || !title.trim()}>
            {busy ? 'Guardando…' : editing ? 'Guardar' : 'Crear tarea'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label hint="prueba: mañana !alta #proyecto">Título</Label>
          <Input autoFocus placeholder="¿Qué hay que hacer?" value={title} onChange={(e) => setTitle(e.target.value)} />
          {nlp.chips.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-2xs text-subtle">Detectado:</span>
              {nlp.chips.map((c) => (
                <span key={c.k} className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-2xs font-medium text-accent">
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>Prioridad</Label>
          <Segmented
            value={priority}
            onChange={setPriority}
            className="w-full [&>button]:flex-1"
            options={Object.values(PRIORITIES).map((p) => ({ value: p.id, label: p.label }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Proyecto</Label>
            <Select value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="">Sin proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label hint="opcional">Fecha límite</Label>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3.5 py-3">
          <input type="checkbox" checked={today} onChange={(e) => setToday(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
          <span className="text-sm text-ink">Añadir a “Tareas de hoy”</span>
          {due === todayISO() && <span className="ml-auto text-2xs text-subtle">vence hoy</span>}
        </label>

        <div>
          <Label hint="al completarla se crea la siguiente"><span className="inline-flex items-center gap-1.5"><Repeat size={13} /> Repetir</span></Label>
          <Segmented
            value={recur}
            onChange={setRecur}
            className="w-full [&>button]:flex-1"
            options={RECUR_OPTIONS}
          />
        </div>

        {/* Subtareas */}
        <div>
          <Label hint={subtasks.length ? `${subtasks.filter((s) => s.done).length}/${subtasks.length}` : ''}>
            Subtareas
          </Label>
          <div className="space-y-1.5">
            {subtasks.map((s, i) => (
              <div key={i} className="group flex items-center gap-2.5 rounded-lg border border-line bg-surface-2/60 px-3 py-2">
                <Checkbox
                  size={17}
                  checked={s.done}
                  onChange={() => setSubtasks((list) => list.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
                />
                <span className={cx('flex-1 text-[13px]', s.done ? 'text-subtle line-through' : 'text-ink')}>{s.t}</span>
                <button
                  type="button"
                  onClick={() => setSubtasks((list) => list.filter((_, j) => j !== i))}
                  className="grid h-6 w-6 place-items-center rounded text-subtle transition-colors hover:bg-danger/12 hover:text-danger"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Añadir subtarea…"
                value={subDraft}
                onChange={(e) => setSubDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSub()
                  }
                }}
                className="h-9 text-[13px]"
              />
              <Button type="button" variant="secondary" size="sm" icon={Plus} className="h-9 shrink-0" onClick={addSub}>
                Añadir
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}
