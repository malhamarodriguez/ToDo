import { createClient } from '@supabase/supabase-js'

// Credenciales del proyecto Supabase.
// Prioridad: variables de entorno (build) > configuración guardada en el
// dispositivo (runtime) > valores por defecto del proyecto (abajo).
//
// NOTA: la clave de abajo es la "anon / public", pensada para usarse en el
// navegador y protegida por las políticas RLS de la base de datos. No es
// secreta (toda app web de Supabase la incluye en el cliente). La clave
// "service_role" NUNCA debe ir aquí.
const DEFAULT_URL = 'https://ogjjezqqqlpphbaupzow.supabase.co'
const DEFAULT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9namplenFxcWxwcGhiYXVwem93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNDEzNjMsImV4cCI6MjA5NzkxNzM2M30.iDT2ivNKphzhf-eA69I9K4gnbhXL8VnV_09Pe3KQiE0'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function getConfig() {
  return {
    url: envUrl || localStorage.getItem('nucleo:sb_url') || DEFAULT_URL,
    key: envKey || localStorage.getItem('nucleo:sb_key') || DEFAULT_KEY,
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
