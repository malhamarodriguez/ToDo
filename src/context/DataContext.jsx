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

  // Cargar todas las colecciones + perfil al iniciar sesión
  useEffect(() => {
    let active = true
    if (!user) {
      setData(empty())
      setLoading(false)
      return
    }
    setLoading(true)
    ;(async () => {
      try {
        const results = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')))
        if (!active) return
        const next = empty()
        TABLES.forEach((t, i) => {
          next[t] = results[i].data || []
        })
        next.tasks.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        setData(next)

        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        if (prof?.settings && Object.keys(prof.settings).length) {
          lastSettings.current = JSON.stringify(prof.settings)
          app.hydrateSettings(prof.settings)
        } else {
          lastSettings.current = JSON.stringify(app.settings)
          // Crear la fila de perfil si aún no existe (sin depender de triggers)
          if (!prof) await supabase.from('profiles').upsert({ id: user.id, name: app.settings.name || '' })
        }
      } catch (err) {
        console.warn('Carga de datos:', err?.message || err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persistir ajustes en el perfil (sincroniza tema/nombre entre dispositivos)
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

  const remove = useCallback(
    async (table, id) => {
      setData((d) => ({ ...d, [table]: d[table].filter((r) => r.id !== id) }))
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) app.toast({ type: 'danger', title: 'No se pudo borrar', desc: error.message })
    },
    [app]
  )

  // Tareas: alternar completada
  const toggleTask = useCallback(
    (id) => {
      const t = data.tasks.find((x) => x.id === id)
      if (t) update('tasks', id, { status: t.status === 'done' ? 'todo' : 'done' })
    },
    [data.tasks, update]
  )

  // Tareas: mover/reordenar con cálculo de posición
  const moveTask = useCallback(
    (id, status, target) => {
      const col = data.tasks
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
    [data.tasks, update]
  )

  const value = { ...data, loading, add, update, remove, toggleTask, moveTask }
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
