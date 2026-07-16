# Summa como producto — guía de lanzamiento

> **ESTADO ACTUAL: BETA GRATUITA.** Los precios están retirados de la landing
> y todos los límites del plan Gratis desactivados (`BETA_FREE = true` en
> `src/lib/plan.js`). Para encender cobros: poner `BETA_FREE = false`,
> restaurar la sección de precios de la landing y seguir la guía Stripe de abajo.

Estado actual (ya publicado):

- **Landing pública** con precios y CTA en la raíz; la app vive tras el login.
- **Demo sin registro** (datos de ejemplo locales, banner con salida a registro).
- **Planes Free/Pro**: límites suaves en Free (proyectos 3 · clientes 3 · metas 5 ·
  presupuestos 3 · ahorro 2) con modal de mejora. Pro se lee de `profiles.plan`.
- **Legal**: páginas de privacidad y términos enlazadas del footer.
- Multi-usuario real: cada cuenta solo ve sus datos (RLS).

## 1) SQL pendiente (2 min, Supabase → SQL Editor)

```sql
-- Duración de eventos del calendario (si no lo ejecutaste ya)
alter table public.events
  add column if not exists duration text default 'hora',
  add column if not exists end_date date;

-- Plan del usuario (free | pro)
alter table public.profiles
  add column if not exists plan text default 'free';
```

### Activarte Pro a ti mismo (tu cuenta personal)

```sql
update public.profiles set plan = 'pro'
where id = (select id from auth.users where email = 'TU_EMAIL_AQUI');
```

## 2) Cobrar con Stripe — pasos exactos

Todo el código ya está listo en el repo:
`supabase/functions/stripe-webhook/index.ts` (webhook) y `src/lib/billing.js`
(enlaces de pago). El flujo queda: pago → webhook → `plan='pro'` → la app desbloquea.

**A. SQL (una vez):**

```sql
alter table public.profiles
  add column if not exists stripe_customer_id text;
```

**B. Stripe (stripe.com):**
1. Crea la cuenta (modo test primero si quieres probar).
2. *Product catalog → Add product*: "Summa Pro" con 2 precios recurrentes:
   4,99 €/mes y 49 €/año. Opcional: prueba gratis de 14 días en el precio.
3. *Payment Links → New*: uno por precio. En cada link, en "After payment"
   pon la URL de la app como redirección.
4. Copia los 2 enlaces `https://buy.stripe.com/…`.

**C. Supabase (supabase.com → tu proyecto):**
1. *Edge Functions → Deploy new function* → nombre `stripe-webhook` →
   pega el contenido de `supabase/functions/stripe-webhook/index.ts` → Deploy.
2. En los detalles de la función, **desactiva "Enforce JWT verification"**.
3. Copia la URL de la función (`https://<ref>.supabase.co/functions/v1/stripe-webhook`).

**D. Conectar ambos:**
1. Stripe → *Developers → Webhooks → Add endpoint* → pega la URL de la función.
   Eventos: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`.
2. Copia el **Signing secret** (`whsec_…`) → Supabase → *Edge Functions →
   Secrets* → crea `STRIPE_WEBHOOK_SECRET` con ese valor.

**E. Enlaces en la app:** pega los 2 Payment Links en `src/lib/billing.js`
(o pásaselos a Claude y los publica). La app añade sola el email del usuario
y su referencia al checkout, para que el webhook active el plan sin ambigüedad.

> Nunca compartas la *service role key* ni el *signing secret* fuera de
> Supabase. Los Payment Links sí son públicos.

## 3) Dominio propio (~10 €/año)

Compra el dominio → GitHub repo → Settings → Pages → *Custom domain* → añade el
CNAME que te indique GitHub en tu proveedor DNS. HTTPS automático. Después,
actualiza la *Site URL* en Supabase → Authentication → URL Configuration.

## 4) Siguientes palancas de producto (orden sugerido)

1. Tareas/movimientos **recurrentes** + plantillas (retención).
2. **Revisión semanal** guiada + informe mensual (hábito).
3. **Time tracking** por cliente + facturas PDF (valor autónomo).
4. Import **CSV bancario** + auto-categorización.
5. Push + tiempo real; después IA y banca abierta.

## Notas

- La demo no toca la nube: vive en `localStorage` del visitante.
- El registro está abierto a cualquiera (es un producto). Los límites Free se
  aplican en la interfaz; el cumplimiento estricto llegará con el webhook de
  Stripe y políticas en base de datos.
