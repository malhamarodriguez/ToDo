import { Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { findProject, PRIORITIES } from '../../lib/data'
import { Checkbox, Badge, Chip, Dot } from '../ui'
import { cx } from '../../lib/utils'

function subProgress(t) {
  if (!t.subtasks?.length) return null
  const done = t.subtasks.filter((s) => s.done).length
  return { done, total: t.subtasks.length }
}

export function TaskRow({ task, compact }) {
  const { toggleTask, remove, projects } = useData()
  const done = task.status === 'done'
  const proj = findProject(projects, task.project_id)
  const prio = PRIORITIES[task.priority] || PRIORITIES.media
  const sp = subProgress(task)

  return (
    <div
      className={cx(
        'group flex items-center gap-3 rounded-lg border border-transparent px-3 transition-all duration-200 hover:border-line hover:bg-surface-2/60',
        compact ? 'py-2' : 'py-2.5'
      )}
    >
      <Checkbox checked={done} onChange={() => toggleTask(task.id)} size={compact ? 18 : 20} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Dot color={prio.hsl} size={7} className="shrink-0" />
          <span className={cx('truncate text-sm font-medium transition-colors', done ? 'text-subtle line-through' : 'text-ink')}>
            {task.title}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {proj && <Chip color={proj.color}>{proj.name}</Chip>}
          {sp && <span className="text-2xs tabular text-subtle">{sp.done}/{sp.total} subtareas</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {task.overdue && !done && <Badge tone="danger">Atrasada</Badge>}
        {task.today && !task.overdue && !done && <Badge tone="accent">Hoy</Badge>}
        <button
          onClick={() => remove('tasks', task.id)}
          className="grid h-7 w-7 place-items-center rounded-md text-subtle opacity-0 transition-all hover:bg-danger/12 hover:text-danger group-hover:opacity-100"
          aria-label="Borrar"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
