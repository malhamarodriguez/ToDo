import { useAuth } from '../../context/AuthContext'
import { DataProvider } from '../../context/DataContext'
import { SetupScreen } from './SetupScreen'
import { AuthScreen } from './AuthScreen'
import { Mark } from '../layout/Logo'

function Splash() {
  return (
    <div className="app-canvas grid min-h-[100dvh] place-items-center">
      <div className="animate-pulse">
        <Mark size={40} />
      </div>
    </div>
  )
}

export function AuthGate({ children }) {
  const { hasSupabase, loading, user } = useAuth()
  if (!hasSupabase) return <SetupScreen />
  if (loading) return <Splash />
  if (!user) return <AuthScreen />
  return <DataProvider>{children}</DataProvider>
}
