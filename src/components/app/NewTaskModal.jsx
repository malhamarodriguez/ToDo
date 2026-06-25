import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { PRIORITIES } from '../../lib/data'
import { todayISO } from '../../lib/utils'
import { Modal, Button, Label, Input, Select } from '../ui'

export function NewTaskModal() {
  const { quickAdd, setQuickAdd, toast } = useApp()
  const { projects, add } = useData()
  const [title, setTitle] = useState('')
  const [project, setProject] = useState('')
  const [priority, setPriority] = useState('media')
  const [today, setToday] = useState(true)
  const [busy, setBusy] = useState(false)

  const close = () => {
    setQuickAdd(false)
    setTitle('')
  }
  const submit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    const row = await add('tasks', {
      title: title.trim(),
      project_id: project || null,
      priority,
      status: 'todo',
      today,
      due: today ? 'Hoy' : '',
      position: -Date.now(),
    })
    setBusy(false)
    if (row) {
      toast({ type: 'success', title: 'Tarea creada', desc: title.trim() })
      close()
    }
  }

  return (
    <Modal
      open={quickAdd}
      onClose={close}
      title="Nueva tarea"
      subtitle="Captura rápida — añádela a tu flujo"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancelar</Button>
          <Button variant="primary" onClick={submit} disabled={busy}>
            {busy ? 'Guardando…' : 'Crear tarea'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Título</Label>
          <Input autoFocus placeholder="¿Qué hay que hacer?" value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <Label>Prioridad</Label>
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {Object.values(PRIORITIES).map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3.5 py-3">
          <input type="checkbox" checked={today} onChange={(e) => setToday(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
          <span className="text-sm text-ink">Añadir a “Tareas de hoy”</span>
        </label>
      </form>
    </Modal>
  )
}
