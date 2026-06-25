import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, hasSupabase } from '../lib/supabase'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(hasSupabase)

  useEffect(() => {
    if (!hasSupabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user || null,
    loading,
    hasSupabase,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, name) =>
      supabase.auth.signUp({ email, password, options: { data: { name } } }),
    signInMagic: (email) =>
      supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
