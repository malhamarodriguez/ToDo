import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useApp } from './AppContext'

const DataCtx = createContext(null)
export const useData = () => useContext(DataCtx)

export const TABLES = [
  'projects', 'tasks', 'events', 'goals', 'movements', 'budgets', 'savings',
  'holdings', 'clients', 'recurring', 'workouts', 'metrics', 'journal', 'notes',
]

const empty = () => Object.fromEntries(TABLES.map((t) => [t, []]))

export function DataProvider({ children }) {
  const { user } = useAuth()
  const app = useApp()
  const [data, setData] = useState(empty)
  const [loading, setLoading] = useState(true)
  const lastSettings = useRef(null)
  const lastFetch = useRef(0)
  // Ref para leer el estado actual dentro de callbacks sin re-crearlos
  const dataRef = useRef(data)
  dataRef.current = data

  const fetchAll = useCallback(async (uid, { silent } = {}) => {
    if (!silent) setLoading(true)
    // Red lenta o caída: no bloquear la interfaz más de 6s; los datos
    // entran cuando la petición termine.
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

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
      if (prof?.settings && Object.keys(prof.settings).length) {
        lastSettings.current = JSON.stringify(prof.settings)
        app.hydrateSettings(prof.settings)
      } else {
        lastSettings.current = JSON.stringify(app.settings)
        if (!prof) await supabase.from('profiles').upsert({ id: uid, name: app.settings.name || '' })
      }
    } catch (err) {
      console.warn('Carga de datos:', err?.message || err)
    } finally {
      clearTimeout(guard)
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Carga inicial al iniciar sesión
  useEffect(() => {
    if (!user) {
      setData(empty())
      setLoading(false)
      return
    }
    fetchAll(user.id)
  }, [user, fetchAll])

  // Refresco silencioso al volver a la pestaña (sincroniza entre dispositivos)
  useEffect(() => {
    if (!user) return
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
  }, [user, fetchAll])

  // Persistir ajustes en el perfil (debounced)
  useEffect(() => {
    if (!user) return
    const str = JSON.stringify(app.settings)
    if (str === lastSettings.current) return
    const id = setTimeout(async () => {
      lastSettings.current = str
      await supabase
        .from('profiles')
        .upsert({ id: user.id, settings: app.settings, name: app.settings.name, role: app.settings.role })
    }, 700)
    return () => clearTimeout(id)
  }, [app.settings, user])

  const add = useCallback(
    async (table, row) => {
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
    [user, app]
  )

  const update = useCallback(
    async (table, id, patch) => {
      setData((d) => ({ ...d, [table]: d[table].map((r) => (r.id === id ? { ...r, ...patch } : r)) }))
      const { error } = await supabase.from(table).update(patch).eq('id', id)
      if (error) app.toast({ type: 'danger', title: 'No se pudo actualizar', desc: error.message })
    },
    [app]
  )

  // Borrado con "Deshacer": elimina ya, y la notificación permite restaurar la fila tal cual.
  const remove = useCallback(
    async (table, id) => {
      const row = dataRef.current[table]?.find((r) => r.id === id)
      setData((d) => ({ ...d, [table]: d[table].filter((r) => r.id !== id) }))
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) {
        app.toast({ type: 'danger', title: 'No se pudo borrar', desc: error.message })
        return
      }
      if (row) {
        app.toast({
          type: 'success',
          title: 'Eliminado',
          duration: 6000,
          action: {
            label: 'Deshacer',
            onClick: async () => {
              const { data: ins, error: e2 } = await supabase.from(table).insert(row).select().single()
              if (!e2 && ins) setData((d) => ({ ...d, [table]: [ins, ...d[table]] }))
            },
          },
        })
      }
    },
    [app]
  )

  const toggleTask = useCallback(
    (id) => {
      const t = dataRef.current.tasks.find((x) => x.id === id)
      if (t) update('tasks', id, { status: t.status === 'done' ? 'todo' : 'done' })
    },
    [update]
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

  const refetch = useCallback(() => user && fetchAll(user.id, { silent: true }), [user, fetchAll])

  const value = { ...data, loading, add, update, remove, toggleTask, moveTask, refetch }
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
