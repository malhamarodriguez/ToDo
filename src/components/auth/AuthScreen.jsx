import { useState } from 'react'
import { Mail, Lock, User, Sparkles, Settings2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../layout/Logo'
import { Button, Input, Label, Segmented } from '../ui'

export function AuthScreen() {
  const { signIn, signUp, signInMagic } = useAuth()
  const [tab, setTab] = useState('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const fn = tab === 'in' ? signIn(email, password) : signUp(email, password, name)
    const { data, error } = await fn
    setBusy(false)
    if (error) return setMsg({ type: 'error', text: error.message })
    if (tab === 'up' && !data.session) {
      setMsg({ type: 'ok', text: 'Cuenta creada. Revisa tu correo para confirmarla.' })
    }
  }

  const magic = async () => {
    if (!email) return setMsg({ type: 'error', text: 'Escribe tu email primero.' })
    setBusy(true)
    const { error } = await signInMagic(email)
    setBusy(false)
    setMsg(error ? { type: 'error', text: error.message } : { type: 'ok', text: 'Te envié un enlace de acceso al correo.' })
  }

  const reconfig = () => {
    localStorage.removeItem('nucleo:sb_url')
    localStorage.removeItem('nucleo:sb_key')
    location.reload()
  }

  return (
    <div className="app-canvas grid min-h-[100dvh] place-items-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size={34} />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-xl">
          <h1 className="text-xl font-semibold text-ink">
            {tab === 'in' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="mb-5 mt-1 text-[13px] text-muted">
            Tu centro de mando personal, sincronizado.
          </p>

          <Segmented
            className="mb-5 w-full"
            value={tab}
            onChange={(v) => {
              setTab(v)
              setMsg(null)
            }}
            options={[
              { value: 'in', label: 'Entrar' },
              { value: 'up', label: 'Crear cuenta' },
            ]}
          />

          <form onSubmit={submit} className="space-y-3.5">
            {tab === 'up' && (
              <div>
                <Label>Nombre</Label>
                <Input icon={User} placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input
                icon={Mail}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input
                icon={Lock}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {msg && (
              <p className={`text-[13px] ${msg.type === 'error' ? 'text-danger' : 'text-success'}`}>
                {msg.text}
              </p>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Un momento…' : tab === 'in' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-2xs text-subtle">
            <span className="h-px flex-1 bg-line" /> o <span className="h-px flex-1 bg-line" />
          </div>
          <Button variant="secondary" icon={Sparkles} className="w-full" onClick={magic} disabled={busy}>
            Enviarme un enlace de acceso
          </Button>
        </div>

        <button
          onClick={reconfig}
          className="mx-auto mt-4 flex items-center gap-1.5 text-2xs text-subtle transition-colors hover:text-muted"
        >
          <Settings2 size={12} /> Cambiar conexión de base de datos
        </button>
      </div>
    </div>
  )
}
