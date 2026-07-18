import { AuthProvider } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import { AuthGate } from './components/auth/AuthGate'
import { AppShell } from './components/layout/AppShell'
import Inicio from './pages/Inicio'
import Negocio from './pages/Negocio'
import Finanzas from './pages/Finanzas'
import Deporte from './pages/Deporte'
import Metas from './pages/Metas'
import Diario from './pages/Diario'
import Calendario from './pages/Calendario'
import Ajustes from './pages/Ajustes'
import Informe from './pages/Informe'
import Admin from './pages/Admin'
import Fiscal from './pages/Fiscal'
import Hoy from './pages/Hoy'

const PAGES = {
  inicio: Inicio,
  hoy: Hoy,
  negocio: Negocio,
  finanzas: Finanzas,
  deporte: Deporte,
  metas: Metas,
  diario: Diario,
  calendario: Calendario,
  fiscal: Fiscal,
  ajustes: Ajustes,
  informe: Informe,
  admin: Admin,
}

function Router() {
  const { route } = useApp()
  const Page = PAGES[route] || Inicio
  return <Page key={route} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthGate>
          <AppShell>
            <Router />
          </AppShell>
        </AuthGate>
      </AppProvider>
    </AuthProvider>
  )
}
