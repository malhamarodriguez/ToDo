import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileTabBar, MobileDrawer } from './MobileNav'
import { Toaster } from '../ui'
import { NewTaskModal } from '../app/NewTaskModal'

export function AppShell({ children }) {
  return (
    <div className="app-canvas flex min-h-[100dvh] text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden pb-24 lg:pb-0">{children}</main>
      </div>

      <MobileTabBar />
      <MobileDrawer />
      <NewTaskModal />
      <Toaster />
    </div>
  )
}
