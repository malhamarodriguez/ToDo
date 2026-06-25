import { useState } from 'react'
import { Database, ExternalLink, ChevronDown } from 'lucide-react'
import { saveConfig } from '../../lib/supabase'
import { Logo } from '../layout/Logo'
import { Button, Input, Label } from '../ui'

export function SetupScreen() {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [open, setOpen] = useState(false)

  const connect = (e) => {
    e.preventDefault()
    if (!url.trim() || !key.trim()) return
    saveConfig(url, key)
    location.reload()
  }

  return (
    <div className="app-canvas grid min-h-[100dvh] place-items-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size={34} />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/12 text-accent">
              <Database size={20} />
            </span>
            <div>
              <h1 className="text-lg font-semibold text-ink">Conecta tu base de datos</h1>
              <p className="text-[13px] text-muted">Para sincronizar tu info entre dispositivos</p>
            </div>
          </div>

          <form onSubmit={connect} className="space-y-4">
            <div>
              <Label hint="Project URL">URL de Supabase</Label>
              <Input
                placeholder="https://xxxx.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label hint="anon public key">Clave anónima</Label>
              <Input
                placeholder="eyJhbGciOi…"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full" size="lg">
              Conectar
            </Button>
          </form>

          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-4 flex w-full items-center justify-between rounded-lg border border-line bg-surface-2/60 px-3.5 py-2.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            ¿Cómo consigo estos datos?
            <ChevronDown size={16} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {open && (
            <ol className="mt-3 space-y-2 px-1 text-[13px] leading-relaxed text-muted">
              <li>1. Crea un proyecto gratis en <span className="text-ink">supabase.com</span>.</li>
              <li>2. En <span className="text-ink">SQL Editor</span>, pega y ejecuta el archivo <code className="rounded bg-surface-2 px-1 text-2xs">supabase/schema.sql</code> del repo.</li>
              <li>3. En <span className="text-ink">Project Settings → API</span> copia la <span className="text-ink">URL</span> y la <span className="text-ink">anon key</span> aquí arriba.</li>
            </ol>
          )}
          <p className="mt-4 text-center text-2xs text-subtle">
            Se guarda solo en este dispositivo. La clave anónima es pública y segura (protegida por RLS).
          </p>
        </div>
      </div>
    </div>
  )
}
