import { createClient } from '@supabase/supabase-js'

// Las credenciales pueden venir de variables de entorno (build en GitHub
// Pages con secretos) o configurarse en tiempo de ejecución (se guardan en
// localStorage) — útil para el archivo único o para conectar desde cualquier
// dispositivo sin reconstruir.
const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function getConfig() {
  return {
    url: envUrl || localStorage.getItem('nucleo:sb_url') || '',
    key: envKey || localStorage.getItem('nucleo:sb_key') || '',
  }
}

export function saveConfig(url, key) {
  localStorage.setItem('nucleo:sb_url', url.trim())
  localStorage.setItem('nucleo:sb_key', key.trim())
}

const { url, key } = getConfig()

export const hasSupabase = Boolean(url && key)

export const supabase = hasSupabase
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
