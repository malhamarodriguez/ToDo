import { CalendarDays } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { findProject, PRIORITIES } from '../../lib/data'
import { Checkbox, Badge, Chip, Dot } from '../ui'
import { cx, taskOverdue, taskToday, taskDueLabel } from '../../lib/utils'

function subProgress(t) {
  if (!t.subtasks?.length) return null
  const done = t.subtasks.filter((s) => s.done).length
  return { done, total: t.subtasks.length }
}

export function TaskRow({ task, compact }) {
  const { openTask } = useApp()
  const { toggleTask, projects } = useData()
  const done = task.status === 'done'
  const proj = findProject(projects, task.project_id)
  const prio = PRIORITIES[task.priority] || PRIORITIES.media
  const sp = subProgress(task)
  const overdue = taskOverdue(task)
  const hoy = taskToday(task)
  const dueLabel = taskDueLabel(task)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openTask(task)}
      onKeyDown={(e) => e.key === 'Enter' && openTask(task)}
      className={cx(
        'group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 text-left transition-all duration-200 hover:border-line hover:bg-surface-2/60',
        compact ? 'py-2' : 'py-2.5'
      )}
    >
      <span onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={done} onChange={() => toggleTask(task.id)} size={compact ? 18 : 20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Dot color={prio.hsl} size={7} className="shrink-0" />
          <span
            className={cx(
              'truncate text-sm font-medium transition-colors',
              done ? 'text-subtle line-through' : 'text-ink'
            )}
          >
            {task.title}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {proj && <Chip color={proj.color}>{proj.name}</Chip>}
          {sp && (
            <span className="text-2xs tabular text-subtle">
              {sp.done}/{sp.total} subtareas
            </span>
          )}
          {dueLabel && !hoy && !overdue && (
            <span className="inline-flex items-center gap-1 text-2xs text-subtle">
              <CalendarDays size={11} /> {dueLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {overdue && <Badge tone="danger">Atrasada</Badge>}
        {hoy && !overdue && !done && <Badge tone="accent">Hoy</Badge>}
      </div>
    </div>
  )
}
