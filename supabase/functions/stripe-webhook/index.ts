// Núcleo · webhook de Stripe → activa/desactiva el plan Pro.
//
// Cómo desplegarla (sin instalar nada):
//   Supabase → Edge Functions → Deploy new function → nombre: stripe-webhook
//   → pega este archivo → Deploy.
//   IMPORTANTE: en la función, desactiva "Enforce JWT verification"
//   (Stripe no envía JWT). Luego añade el secreto STRIPE_WEBHOOK_SECRET
//   (Edge Functions → Secrets) con el "Signing secret" del webhook de Stripe.
//
// Eventos que maneja:
//   - checkout.session.completed  → plan = 'pro' (por client_reference_id o email)
//   - customer.subscription.updated → pro si active/trialing; free si cancelada
//   - customer.subscription.deleted → plan = 'free'

import Stripe from 'https://esm.sh/stripe@16?target=denonext'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') ?? 'sk_unused', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

async function userIdByEmail(email: string): Promise<string | null> {
  // Búsqueda paginada en auth.users (suficiente hasta miles de usuarios)
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !data?.users?.length) return null
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (hit) return hit.id
    if (data.users.length < 1000) break
  }
  return null
}

async function setPlan(where: { id?: string; customer?: string }, plan: 'pro' | 'free', customer?: string) {
  const patch: Record<string, unknown> = { plan }
  if (customer) patch.stripe_customer_id = customer
  let q = supabase.from('profiles').update(patch)
  if (where.id) q = q.eq('id', where.id)
  else if (where.customer) q = q.eq('stripe_customer_id', where.customer)
  else return
  const { error } = await q
  if (error) console.error('setPlan:', error.message)
}

Deno.serve(async (req) => {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!secret) return new Response('Falta STRIPE_WEBHOOK_SECRET', { status: 500 })

  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Sin firma', { status: 400 })

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider)
  } catch (err) {
    console.error('Firma inválida:', (err as Error).message)
    return new Response('Firma inválida', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        const customer = (s.customer as string) || undefined
        const ref = s.client_reference_id || null
        if (ref) {
          await setPlan({ id: ref }, 'pro', customer)
        } else {
          const email = s.customer_details?.email || s.customer_email
          if (email) {
            const id = await userIdByEmail(email)
            if (id) await setPlan({ id }, 'pro', customer)
            else console.warn('Pago sin usuario coincidente:', email)
          }
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customer = sub.customer as string
        const active = ['active', 'trialing', 'past_due'].includes(sub.status)
        await setPlan({ customer }, active ? 'pro' : 'free')
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await setPlan({ customer: sub.customer as string }, 'free')
        break
      }
    }
  } catch (err) {
    console.error('Webhook:', (err as Error).message)
    return new Response('Error interno', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
