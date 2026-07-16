# Puesta en marcha — Summa

Guía para tener tu app en una **URL** (GitHub Pages) con tus datos
**sincronizados** entre móvil y ordenador (Supabase). Tiempo: ~10 min.

---

## 1) Crea tu base de datos (Supabase)

1. Entra en **[supabase.com](https://supabase.com)** → *New project* (plan gratis).
   Elige nombre y contraseña de base de datos. Espera ~2 min a que se cree.
2. En el panel del proyecto, ve a **SQL Editor → New query**.
3. Abre el archivo **`supabase/schema.sql`** de este repo, copia **todo** su
   contenido, pégalo y pulsa **Run**. Esto crea las tablas y la seguridad (RLS).
4. *(Recomendado para empezar rápido)* En **Authentication → Sign In / Providers
   → Email**, desactiva **“Confirm email”**. Así podrás entrar nada más
   registrarte, sin confirmar el correo. (Puedes reactivarlo cuando quieras.)

## 2) Copia tus credenciales

En **Project Settings → API** copia:

- **Project URL** → `https://xxxxxxxx.supabase.co`
- **anon public** key → `eyJhbGciOi…` *(es pública y segura: la protege el RLS)*

## 3) Publica la web (GitHub Pages)

1. En el repo de GitHub: **Settings → Secrets and variables → Actions →
   New repository secret**. Crea dos:
   - `VITE_SUPABASE_URL` → tu Project URL
   - `VITE_SUPABASE_ANON_KEY` → tu anon key
2. **Settings → Pages → Build and deployment → Source: _GitHub Actions_**.
3. Lanza el despliegue: haz cualquier push, o ve a la pestaña **Actions →
   “Deploy a GitHub Pages” → Run workflow**. En ~1 min tendrás tu URL:
   **`https://malhamarodriguez.github.io/<nombre-del-repo>/`**
4. *(Para enlaces mágicos / confirmación por correo)* En Supabase,
   **Authentication → URL Configuration**, pon esa URL en **Site URL** y en
   **Redirect URLs**.

## 4) Úsalo

Abre la URL en el móvil **y** en el ordenador, **crea tu cuenta** con el mismo
email/contraseña en ambos, y verás **la misma información** en todos lados.
La app empieza **vacía**: añade tus tareas, finanzas, metas, etc.

---

### Alternativas

- **En local:** copia `.env.example` a `.env.local`, rellena las dos variables
  y `npm run dev`.
- **Archivo único** (`npm run build:single`): al abrirlo te pedirá la URL y la
  anon key una vez (se guardan en ese dispositivo) y funcionará igual.
- **Otro hosting** (Vercel/Netlify): conecta el repo y define las mismas dos
  variables de entorno `VITE_SUPABASE_*`.

### Privacidad y seguridad

Cada fila lleva tu `user_id` y las políticas **RLS** impiden que nadie vea datos
de otra cuenta. La `anon key` está pensada para usarse en el navegador.
