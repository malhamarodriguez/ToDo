import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShieldCheck, Users, UserPlus, Activity, RefreshCw, ArrowLeft, Database } from 'lucide-react'
import { PageContainer, PageHeader } from '../components/layout/Page'
import {
  Card, CardHeader, CardBody, Stat, Badge, Avatar, Button, EmptyState,
  Table, THead, TH, TBody, TR, TD,
} from '../components/ui'
import { GroupedBars } from '../components/charts'
import { useData } from '../context/DataContext'
import { useApp } from '../context/AppContext'

const COUNT_LABELS = [
  ['tasks', 'Tareas'],
  ['events', 'Eventos'],
  ['movements', 'Movimientos'],
  ['workouts', 'Entrenos'],
  ['journal', 'Diario'],
  ['goals', 'Metas'],
]

function fecha(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function actividad(ts) {
  if (!ts) return '—'
  const days = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000)
  if (days <= 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

export default function Admin() {
  const { isAdmin, adminOverview } = useData()
  const { navigate } = useApp()
  const [ov, setOv] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setBusy(true)
    setErr('')
    try {
      setOv(await adminOverview())
    } catch (e) {
      setErr(e.message || 'No se pudo cargar')
    } finally {
      setBusy(false)
    }
  }, [adminOverview])

  useEffect(() => {
    if (isAdmin) load()
  }, [isAdmin, load])

  // Altas por semana (últimas 8), calculado en cliente a partir de la lista
  const semanas = useMemo(() => {
    const buckets = [...Array(8)].map((_, i) => ({
      w: i === 7 ? 'ahora' : `-${7 - i}sem`,
      altas: 0,
    }))
    for (const u of ov?.users || []) {
      const d = Math.floor((Date.now() - new Date(u.created_at).getTime()) / 604800000)
      if (d >= 0 && d < 8) buckets[7 - d].altas += 1
    }
    return buckets
  }, [ov])

  if (!isAdmin) {
    return (
      <PageContainer>
        <EmptyState
          icon={ShieldCheck}
          title="Solo para el creador"
          desc="Este espacio muestra la gestión de cuentas de Summa y únicamente es visible para la cuenta administradora."
          action={
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('inicio')}>
              Volver al panel
            </Button>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Creador"
        title="Gestión"
        subtitle="Cuentas registradas y uso global. Los datos personales de cada usuario siguen siendo privados: aquí solo hay cuentas y recuentos."
        actions={
          <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={busy}>
            {busy ? 'Actualizando…' : 'Actualizar'}
          </Button>
        }
      />

      {err && (
        <Card className="mb-5 border-warning/30">
          <CardBody>
            <p className="text-sm font-semibold text-ink">No se pudo cargar la gestión</p>
            <p className="mt-1 text-sm text-muted">
              {err}. Si aún no lo has hecho, ejecuta el SQL de <code className="font-mono text-2xs">supabase/admin.sql</code> en
              Supabase → SQL Editor (viene explicado en PRODUCTO.md).
            </p>
            <Button variant="secondary" size="sm" className="mt-3" icon={RefreshCw} onClick={load}>
              Reintentar
            </Button>
          </CardBody>
        </Card>
      )}

      {ov && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Usuarios totales" value={ov.total_users} icon={Users} highlight />
            <Stat label="Altas · 7 días" value={ov.new_7d} icon={UserPlus} />
            <Stat label="Altas · 30 días" value={ov.new_30d} icon={UserPlus} />
            <Stat label="Activos · 7 días" value={ov.active_7d} icon={Activity} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
            <Card className="lg:col-span-8">
              <CardHeader title="Altas por semana" subtitle="Cuentas nuevas en las últimas 8 semanas" />
              <CardBody>
                <GroupedBars data={semanas} xKey="w" series={[{ key: 'altas', name: 'Altas' }]} height={200} />
              </CardBody>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader title="Uso global" subtitle="Elementos creados entre todos" icon={Database} />
              <CardBody className="space-y-2.5">
                {COUNT_LABELS.map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-line bg-surface-2/50 px-3 py-2">
                    <span className="font-mono text-2xs font-medium uppercase tracking-wide text-muted">{label}</span>
                    <span className="text-sm font-semibold tabular text-ink">{ov.counts?.[key] ?? 0}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <Card className="mt-5">
            <CardHeader
              title="Cuentas"
              subtitle={`${(ov.users || []).length} más recientes · el email es el de acceso`}
            />
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TH>Usuario</TH>
                  <TH>Plan</TH>
                  <TH>Alta</TH>
                  <TH align="right">Última actividad</TH>
                </THead>
                <TBody>
                  {(ov.users || []).map((u) => (
                    <TR key={u.id}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name || u.email} size={30} />
                          <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-medium text-ink">{u.email}</p>
                            {u.name && <p className="truncate text-2xs text-subtle">{u.name}</p>}
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <Badge tone={u.plan === 'pro' ? 'accent' : 'neutral'}>{u.plan}</Badge>
                      </TD>
                      <TD>
                        <span className="text-sm text-muted">{fecha(u.created_at)}</span>
                      </TD>
                      <TD align="right">
                        <span className="text-sm text-muted">{actividad(u.last_seen_at)}</span>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </Card>
        </>
      )}

      {!ov && !err && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
