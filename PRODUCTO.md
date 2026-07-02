# Núcleo como producto — guía de lanzamiento

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

## 2) Cobrar con Stripe (cuando quieras encender ingresos)

La vía sin servidor propio: **Payment Links + un webhook en Supabase Edge Functions**.

1. Crea cuenta en stripe.com → Productos → "Núcleo Pro" (4,99 €/mes y 49 €/año)
   → genera un **Payment Link** de cada uno.
2. En el Payment Link, activa "Recoger email" (se usa para casar con la cuenta).
3. Supabase → **Edge Functions** → nueva función `stripe-webhook` con esta lógica:
   - verifica la firma del evento (`STRIPE_WEBHOOK_SECRET`),
   - en `checkout.session.completed` / `customer.subscription.updated`:
     busca el usuario por email y `update profiles set plan='pro'`,
   - en `customer.subscription.deleted`: vuelve a `free`.
   (Usa la **service_role key** como secreto de la función; nunca en el frontend.)
4. Stripe → Developers → Webhooks → apunta al URL de la función.
5. En la app, sustituye el aviso "Pro llega muy pronto" del `UpgradeModal`
   por `window.open(PAYMENT_LINK)` — un cambio de una línea que hago cuando tengas
   los enlaces.

Con esto el ciclo queda cerrado: pago → webhook → `plan='pro'` → la app desbloquea.

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
