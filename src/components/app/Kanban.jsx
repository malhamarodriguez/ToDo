import { useState } from 'react'
import { Plus, GripVertical } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { projectById, PRIORITIES } from '../../lib/data'
import { Badge, Chip, ProgressBar, Dot } from '../ui'
import { cx } from '../../lib/utils'

const COLUMNS = [
  { id: 'todo', label: 'Por hacer', tone: 'text-muted' },
  { id: 'doing', label: 'En curso', tone: 'text-info' },
  { id: 'done', label: 'Hecho', tone: 'text-success' },
]

function KanbanCard({ task, onDragStart, dragging }) {
  const proj = projectById(task.project)
  const prio = PRIORITIES[task.priority]
  const sp = task.subtasks?.length
    ? Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100)
    : null
  const done = task.status === 'done'

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={cx(
        'group cursor-grab rounded-xl border border-line bg-surface p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md active:cursor-grabbing',
        dragging && 'opacity-40'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Dot color={prio.hsl} size={7} />
          <span className="text-2xs font-medium uppercase tracking-wide text-subtle">{prio.label}</span>
        </div>
        <GripVertical size={14} className="text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <h4 className={cx('text-sm font-medium leading-snug text-ink', done && 'text-subtle line-through')}>
        {task.title}
      </h4>

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
        {!task.today && !task.overdue && task.due && (
          <span className="text-2xs text-subtle">{task.due}</span>
        )}
      </div>
    </article>
  )
}

export function KanbanBoard({ tasks }) {
  const { moveTask, setQuickAdd } = useApp()
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  const onDragStart = (e, id) => {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
  const onDrop = (status) => {
    if (dragId) moveTask(dragId, status)
    setDragId(null)
    setOverCol(null)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.id)
        const isOver = overCol === col.id
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault()
              setOverCol(col.id)
            }}
            onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
            onDrop={() => onDrop(col.id)}
            className={cx(
              'flex flex-col rounded-2xl border bg-surface-2/40 transition-colors duration-200',
              isOver ? 'border-accent/50 bg-accent/[0.04]' : 'border-line'
            )}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={cx('text-sm font-semibold', col.tone)}>{col.label}</span>
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-surface px-1.5 text-2xs font-semibold tabular text-muted">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setQuickAdd(true)}
                className="grid h-6 w-6 place-items-center rounded-md text-subtle transition-colors hover:bg-surface hover:text-ink"
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2.5 px-3 pb-3">
              {items.map((t) => (
                <KanbanCard key={t.id} task={t} dragging={dragId === t.id} onDragStart={onDragStart} />
              ))}
              {items.length === 0 && (
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
