import { useState } from 'react'
import { Plus, LayoutList, Columns3, SlidersHorizontal, Briefcase, FolderPlus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { KanbanBoard } from '../components/app/Kanban'
import { TaskRow } from '../components/app/TaskRow'
import { RecordModal } from '../components/app/RecordModal'
import { Button, Segmented, Select, Dot, Card, EmptyState } from '../components/ui'
import { cx, taskOverdue } from '../lib/utils'
import { canCreate, FREE_LIMITS } from '../lib/plan'

export default function Negocio() {
  const { setQuickAdd, setUpgradeOpen } = useApp()
  const { tasks, projects, remove, isPro } = useData()
  const newProject = () => {
    if (!canCreate('projects', projects.length, isPro)) {
      return setUpgradeOpen(`El plan Gratis incluye ${FREE_LIMITS.projects} proyectos — pasa a Pro para crear ilimitados.`)
    }
    setProjModal(true)
  }
  const [view, setView] = useState('kanban')
  const [project, setProject] = useState('all')
  const [priority, setPriority] = useState('all')
  const [projModal, setProjModal] = useState(false)

  const filtered = tasks.filter(
    (t) => (project === 'all' || t.project_id === project) && (priority === 'all' || t.priority === priority)
  )
  const stats = [
    { label: 'Total', value: filtered.length },
    { label: 'En curso', value: filtered.filter((t) => t.status === 'doing').length },
    { label: 'Atrasadas', value: filtered.filter((t) => taskOverdue(t)).length, tone: 'text-danger' },
    { label: 'Hechas', value: filtered.filter((t) => t.status === 'done').length, tone: 'text-success' },
  ]

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Espacio de trabajo"
        title="Negocio"
        subtitle="Consultoría, SaaS y marca personal en un solo flujo."
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[
              { value: 'lista', label: 'Lista', icon: LayoutList },
              { value: 'kanban', label: 'Kanban', icon: Columns3 },
            ]} />
            <Button variant="primary" icon={Plus} onClick={() => setQuickAdd(true)}>
              <span className="hidden sm:inline">Nueva tarea</span>
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} hover className="px-4 py-3">
            <p className="text-2xs font-medium uppercase tracking-wide text-subtle">{s.label}</p>
            <p className={cx('mt-1 font-display text-2xl font-bold tabular', s.tone || 'text-ink')}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-subtle">
          <SlidersHorizontal size={13} /> Filtros
        </span>
        <button onClick={() => setProject('all')}
          className={cx('rounded-full border px-3 py-1 text-[13px] font-medium transition-colors',
            project === 'all' ? 'border-accent/40 bg-accent/12 text-accent' : 'border-line text-muted hover:border-line-strong hover:text-ink')}>
          Todos
        </button>
        {projects.map((p) => (
          <button key={p.id} onClick={() => setProject(p.id === project ? 'all' : p.id)}
            className={cx('group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition-colors',
              project === p.id ? 'border-line-strong bg-surface-2 text-ink' : 'border-line text-muted hover:border-line-strong hover:text-ink')}>
            <Dot color={p.color} size={7} />
            {p.name}
          </button>
        ))}
        <Button variant="ghost" size="sm" icon={FolderPlus} onClick={newProject}>Proyecto</Button>
        <div className="ml-auto w-36">
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-9 text-[13px]">
            <option value="all">Toda prioridad</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </Select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={Briefcase}
            title="Tu tablero está vacío"
            desc="Crea tu primera tarea o un proyecto para organizar el trabajo de tu negocio."
            action={<Button variant="primary" icon={Plus} onClick={() => setQuickAdd(true)}>Crear primera tarea</Button>}
          />
        </Card>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={filtered} />
      ) : (
        <div className="space-y-6">
          {projects.filter((p) => project === 'all' || p.id === project).map((p) => {
            const items = filtered.filter((t) => t.project_id === p.id)
            if (!items.length) return null
            return (
              <div key={p.id}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <button onClick={() => setProjModal({ row: p })} className="flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-surface-2">
                    <Dot color={p.color} size={9} ring />
                    <h3 className="text-sm font-semibold text-ink">{p.name}</h3>
                  </button>
                  <span className="text-2xs tabular text-subtle">{items.length}</span>
                </div>
                <Card className="p-2">
                  <div className="space-y-0.5">{items.map((t) => <TaskRow key={t.id} task={t} />)}</div>
                </Card>
              </div>
            )
          })}
          {/* Tareas sin proyecto */}
          {(() => {
            const orphan = filtered.filter((t) => !t.project_id)
            if (!orphan.length) return null
            return (
              <div>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <Dot color="220 10% 50%" size={9} />
                  <h3 className="text-sm font-semibold text-ink">Sin proyecto</h3>
                  <span className="text-2xs tabular text-subtle">{orphan.length}</span>
                </div>
                <Card className="p-2"><div className="space-y-0.5">{orphan.map((t) => <TaskRow key={t.id} task={t} />)}</div></Card>
              </div>
            )
          })()}
        </div>
      )}

      {projModal && (
        <RecordModal
          open
          onClose={() => setProjModal(false)}
          title={projModal.row ? 'Editar proyecto' : 'Nuevo proyecto'}
          subtitle="Agrupa tareas y dale un color"
          table="projects"
          initial={projModal.row}
          onDelete={projModal.row ? () => remove('projects', projModal.row.id) : undefined}
          fields={[
            { key: 'name', label: 'Nombre', type: 'text', required: true, autoFocus: true, placeholder: 'p. ej. SaaS · Núcleo' },
            { key: 'color', label: 'Color', type: 'color' },
          ]}
        />
      )}
    </PageContainer>
  )
}
