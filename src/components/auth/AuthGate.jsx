import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { DataProvider } from '../../context/DataContext'
import { isDemo } from '../../lib/demo'
import { SetupScreen } from './SetupScreen'
import { AuthScreen } from './AuthScreen'
import { Mark } from '../layout/Logo'
import Landing, { Legal } from '../../pages/Landing'

function Splash() {
  return (
    <div className="app-canvas grid min-h-[100dvh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Mark size={44} />
        </div>
        <p className="text-2xs font-medium uppercase tracking-[0.22em] text-subtle">Todo cuenta.</p>
      </div>
    </div>
  )
}

// Web pública para visitantes: landing, acceso y legal.
function Marketing() {
  const { route } = useApp()
  if (route === 'acceso') return <AuthScreen />
  if (route === 'privacidad' || route === 'terminos') return <Legal page={route} />
  return <Landing />
}

export function AuthGate({ children }) {
  const { hasSupabase, loading, user } = useAuth()

  // Modo demo: la app entera con datos locales, sin cuenta.
  if (isDemo()) return <DataProvider demo>{children}</DataProvider>

  if (!hasSupabase) return <SetupScreen />
  if (loading) return <Splash />
  if (!user) return <Marketing />
  return <DataProvider>{children}</DataProvider>
}
