// Enlaces de pago de Stripe (Payment Links).
// Cuando existan, el botón "Mejorar a Pro" abre el checkout directamente.
// Pega aquí los enlaces (https://buy.stripe.com/...) y despliega.
export const PAYMENT_LINKS = {
  monthly: '', // Núcleo Pro · 4,99 €/mes
  yearly: '', // Núcleo Pro · 49 €/año
}

// Añade al enlace la referencia del usuario para que el webhook
// active el plan sin ambigüedad, y su email ya rellenado.
export function checkoutUrl(kind, user) {
  const base = PAYMENT_LINKS[kind]
  if (!base) return null
  try {
    const u = new URL(base)
    if (user?.id) u.searchParams.set('client_reference_id', user.id)
    if (user?.email) u.searchParams.set('prefilled_email', user.email)
    return u.toString()
  } catch {
    return base
  }
}

export const billingReady = () => Boolean(PAYMENT_LINKS.monthly || PAYMENT_LINKS.yearly)
