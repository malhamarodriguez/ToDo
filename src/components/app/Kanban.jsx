import { useState } from 'react'
import { Plus, GripVertical } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { findProject, PRIORITIES } from '../../lib/data'
import { Badge, Chip, ProgressBar, Dot } from '../ui'
import { cx } from '../../lib/utils'

const COLUMNS = [
  { id: 'todo', label: 'Por hacer', tone: 'text-muted', accent: '218 14% 50%' },
  { id: 'doing', label: 'En curso', tone: 'text-info', accent: '213 90% 62%' },
  { id: 'done', label: 'Hecho', tone: 'text-success', accent: '152 56% 46%' },
]

function DropLine({ show }) {
  return (
    <div
      className={cx(
        'pointer-events-none -my-1 h-0.5 origin-left rounded-full bg-accent transition-all duration-150',
        show ? 'scale-x-100 opacity-100 shadow-[0_0_8px_hsl(var(--accent)/0.6)]' : 'scale-x-0 opacity-0'
      )}
    />
  )
}

function KanbanCard({ task, projects, onDragStart, onDragEnd, onDragOverCard, dragging }) {
  const proj = findProject(projects, task.project_id)
  const prio = PRIORITIES[task.priority] || PRIORITIES.media
  const sp = task.subtasks?.length
    ? Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100)
    : null
  const done = task.status === 'done'

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOverCard(e, task.id)}
      className={cx(
        'group select-none rounded-xl border bg-surface p-3.5 shadow-xs transition-all duration-200',
        dragging
          ? 'rotate-1 scale-[0.98] border-dashed border-accent/50 bg-accent/[0.05] opacity-50'
          : 'cursor-grab border-line hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md active:cursor-grabbing active:scale-[0.99]'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Dot color={prio.hsl} size={7} ring />
          <span className="text-2xs font-medium uppercase tracking-wide text-subtle">{prio.label}</span>
        </div>
        <GripVertical size={14} className="-mr-1 text-subtle opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>
      <h4 className={cx('text-sm font-medium leading-snug text-ink', done && 'text-subtle line-through')}>{task.title}</h4>

      {sp != null && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-2xs text-subtle">
            <span>Subtareas</span>
            <span className="tabular">{sp}%</span>
          </div>
          <ProgressBar value={sp} size="sm" color={proj?.color} />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {proj && <Chip color={proj.color}>{proj.name}</Chip>}
        {task.overdue && !done && <Badge tone="danger">Atrasada</Badge>}
        {task.today && !task.overdue && !done && <Badge tone="accent">Hoy</Badge>}
        {!task.today && !task.overdue && task.due && <span className="text-2xs text-subtle">{task.due}</span>}
      </div>
    </article>
  )
}

export function KanbanBoard({ tasks }) {
  const { setQuickAdd } = useApp()
  const { moveTask, projects } = useData()
  const [dragId, setDragId] = useState(null)
  const [target, setTarget] = useState(null)

  const onDragStart = (e, id) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
  const onDragEnd = () => {
    setDragId(null)
    setTarget(null)
  }
  const onDragOverCard = (e, col, taskId) => {
    e.preventDefault()
    e.stopPropagation()
    if (taskId === dragId) return
    const r = e.currentTarget.getBoundingClientRect()
    const pos = e.clientY < r.top + r.height / 2 ? 'before' : 'after'
    setTarget({ col, taskId, pos })
  }
  const onDrop = (col) => {
    if (dragId) moveTask(dragId, col, target?.col === col ? target : null)
    onDragEnd()
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.id)
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault()
              if (!items.length) setTarget({ col: col.id, taskId: null, pos: 'end' })
            }}
            onDrop={() => onDrop(col.id)}
            className={cx(
              'flex flex-col rounded-2xl border bg-surface-2/40 transition-colors duration-200',
              target?.col === col.id ? 'border-accent/50 bg-accent/[0.04]' : 'border-line'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: `hsl(${col.accent})` }} />
                <span className={cx('text-sm font-semibold', col.tone)}>{col.label}</span>
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-surface px-1.5 text-2xs font-semibold tabular text-muted">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setQuickAdd(true)}
                className="grid h-6 w-6 place-items-center rounded-md text-subtle transition-all hover:scale-110 hover:bg-surface hover:text-ink active:scale-95"
              >
                <Plus size={15} />
              </button>
            </div>

            <div
              className="flex min-h-[140px] flex-1 flex-col gap-2.5 px-3 pb-3"
              onDragOver={(e) => {
                if (e.target === e.currentTarget) {
                  e.preventDefault()
                  setTarget({ col: col.id, taskId: null, pos: 'end' })
                }
              }}
            >
              {items.map((t) => (
                <div key={t.id}>
                  <DropLine show={target?.col === col.id && target.taskId === t.id && target.pos === 'before'} />
                  <KanbanCard
                    task={t}
                    projects={projects}
                    dragging={dragId === t.id}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOverCard={(e, id) => onDragOverCard(e, col.id, id)}
                  />
                  <DropLine show={target?.col === col.id && target.taskId === t.id && target.pos === 'after'} />
                </div>
              ))}

              {target?.col === col.id && target.taskId == null && (
                <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/[0.05] py-6" />
              )}
              {items.length === 0 && !(target?.col === col.id) && (
                <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-line py-8 text-center text-2xs text-subtle">
                  Suelta tareas aquí
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
