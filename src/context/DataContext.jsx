import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useApp } from './AppContext'
import { demoSeed } from '../lib/demo'
import { uid } from '../lib/utils'
import { getRecur, nextDue } from '../lib/nlp'

const DataCtx = createContext(null)
export const useData = () => useContext(DataCtx)

export const TABLES = [
  'projects', 'tasks', 'events', 'goals', 'movements', 'budgets', 'savings',
  'holdings', 'clients', 'recurring', 'workouts', 'metrics', 'journal', 'notes',
]

const empty = () => Object.fromEntries(TABLES.map((t) => [t, []]))
const DEMO_DATA_KEY = 'summa:demo-data'

export function DataProvider({ children, demo = false }) {
  const { user } = useAuth()
  const app = useApp()
  const [data, setData] = useState(empty)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const lastSettings = useRef(null)
  const lastFetch = useRef(0)
  const dataRef = useRef(data)
  dataRef.current = data

  // ---------- Modo demo: todo en local ----------
  useEffect(() => {
    if (!demo) return
    try {
      const saved = JSON.parse(localStorage.getItem(DEMO_DATA_KEY) || 'null')
      setData(saved && saved.tasks ? { ...empty(), ...saved } : demoSeed())
    } catch {
      setData(demoSeed())
    }
    setProfile({ plan: 'pro', demo: true })
    setLoading(false)
  }, [demo])

  const persistDemo = (next) => {
    try {
      localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(next))
    } catch {}
  }
  const setBoth = useCallback(
    (updater) => {
      setData((d) => {
        const next = updater(d)
        if (demo) persistDemo(next)
        return next
      })
    },
    [demo]
  )

  // ---------- Nube (Supabase) ----------
  const fetchAll = useCallback(async (uid_, { silent } = {}) => {
    if (!silent) setLoading(true)
    const guard = setTimeout(() => setLoading(false), 6000)
    try {
      const results = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')))
      const next = empty()
      TABLES.forEach((t, i) => {
        next[t] = results[i].data || []
      })
      next.tasks.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      setData(next)
      lastFetch.current = Date.now()

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', uid_).maybeSingle()
      setProfile(prof || null)
      if (prof?.settings && Object.keys(prof.settings).length) {
        lastSettings.current = JSON.stringify(prof.settings)
        app.hydrateSettings(prof.settings)
      } else {
        lastSettings.current = JSON.stringify(app.settings)
        if (!prof) await supabase.from('profiles').upsert({ id: uid_, name: app.settings.name || '' })
      }
    } catch (err) {
      console.warn('Carga de datos:', err?.message || err)
    } finally {
      clearTimeout(guard)
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (demo) return
    if (!user) {
      setData(empty())
      setLoading(false)
      return
    }
    fetchAll(user.id)
  }, [user, fetchAll, demo])

  // Presencia y rol de creador. Silencioso a propósito: si el SQL del
  // módulo de gestión aún no se ha ejecutado, la app sigue funcionando igual.
  useEffect(() => {
    if (demo || !user) {
      setIsAdmin(false)
      return
    }
    supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email || '', last_seen_at: new Date().toISOString() })
      .then(() => {})
    supabase.rpc('is_admin').then(({ data: ok }) => setIsAdmin(Boolean(ok)))
  }, [user, demo])

  const adminOverview = useCallback(async () => {
    const { data: ov, error } = await supabase.rpc('admin_overview')
    if (error) throw new Error(error.message)
    return ov
  }, [])

  // Refresco silencioso al volver a la pestaña
  useEffect(() => {
    if (demo || !user) return
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastFetch.current < 25000) return
      fetchAll(user.id, { silent: true })
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [user, fetchAll, demo])

  // Persistir ajustes en el perfil (solo nube)
  useEffect(() => {
    if (demo || !user) return
    const str = JSON.stringify(app.settings)
    if (str === lastSettings.current) return
    const id = setTimeout(async () => {
      lastSettings.current = str
      await supabase
        .from('profiles')
        .upsert({ id: user.id, settings: app.settings, name: app.settings.name, role: app.settings.role })
    }, 700)
    return () => clearTimeout(id)
  }, [app.settings, user, demo])

  // ---------- CRUD (nube o demo) ----------
  const add = useCallback(
    async (table, row) => {
      if (demo) {
        const ins = { id: uid(), ...row }
        setBoth((d) => ({ ...d, [table]: [ins, ...d[table]] }))
        return ins
      }
      const { data: ins, error } = await supabase
        .from(table)
        .insert({ ...row, user_id: user.id })
        .select()
        .single()
      if (error) {
        app.toast({ type: 'danger', title: 'No se pudo guardar', desc: error.message })
        return null
      }
      setData((d) => ({ ...d, [table]: [ins, ...d[table]] }))
      return ins
    },
    [user, app, demo, setBoth]
  )

  const update = useCallback(
    async (table, id, patch) => {
      setBoth((d) => ({ ...d, [table]: d[table].map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
      if (demo) return
      const { error } = await supabase.from(table).update(patch).eq('id', id)
      if (error) app.toast({ type: 'danger', title: 'No se pudo actualizar', desc: error.message })
    },
    [app, demo, setBoth]
  )

  const remove = useCallback(
    async (table, id) => {
      const row = dataRef.current[table]?.find((r) => r.id === id)
      setBoth((d) => ({ ...d, [table]: d[table].filter((r) => r.id !== id) }))
      if (!demo) {
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) {
          app.toast({ type: 'danger', title: 'No se pudo borrar', desc: error.message })
          return
        }
      }
      if (row) {
        app.toast({
          type: 'success',
          title: 'Eliminado',
          duration: 6000,
          action: {
            label: 'Deshacer',
            onClick: async () => {
              if (demo) {
                setBoth((d) => ({ ...d, [table]: [row, ...d[table]] }))
                return
              }
              const { data: ins, error: e2 } = await supabase.from(table).insert(row).select().single()
              if (!e2 && ins) setData((d) => ({ ...d, [table]: [ins, ...d[table]] }))
            },
          },
        })
      }
    },
    [app, demo, setBoth]
  )

  const toggleTask = useCallback(
    (id) => {
      const t = dataRef.current.tasks.find((x) => x.id === id)
      if (!t) return
      const completing = t.status !== 'done'
      update('tasks', id, { status: completing ? 'done' : 'todo' })
      // Recurrentes: al completar, se crea sola la próxima ocurrencia.
      if (completing) {
        const recur = getRecur(t)
        if (!recur) return
        const due = nextDue(t.due, recur)
        const dupe = dataRef.current.tasks.some(
          (x) => x.id !== id && x.title === t.title && x.due === due && x.status !== 'done'
        )
        if (dupe) return
        add('tasks', {
          title: t.title,
          project_id: t.project_id || null,
          priority: t.priority,
          status: 'todo',
          due,
          today: false,
          subtasks: (t.subtasks || []).map((s) => ({ ...s, done: false })),
          tags: t.tags || [],
          position: (t.position ?? 0) + 0.001,
        })
        app.toast({ type: 'info', title: '↻ Tarea recurrente', desc: `Próxima creada para el ${due.slice(8, 10)}/${due.slice(5, 7)}` })
      }
    },
    [update, add, app]
  )

  const moveTask = useCallback(
    (id, status, target) => {
      const col = dataRef.current.tasks
        .filter((t) => t.status === status && t.id !== id)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      let pos
      if (!target || target.taskId == null) {
        pos = (col.length ? col[col.length - 1].position : 0) + 1
      } else {
        const idx = col.findIndex((t) => t.id === target.taskId)
        const at = target.pos === 'after' ? idx + 1 : idx
        const prev = col[at - 1]
        const nextT = col[at]
        if (!prev) pos = (nextT?.position ?? 0) - 1
        else if (!nextT) pos = prev.position + 1
        else pos = (prev.position + nextT.position) / 2
      }
      update('tasks', id, { status, position: pos })
    },
    [update]
  )

  const refetch = useCallback(() => !demo && user && fetchAll(user.id, { silent: true }), [user, fetchAll, demo])

  const isPro = demo || profile?.plan === 'pro'

  const value = { ...data, loading, demo, profile, isPro, isAdmin, adminOverview, add, update, remove, toggleTask, moveTask, refetch }
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
