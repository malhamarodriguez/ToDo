// Favicon dinámico: baldosa con el acento actual y la Σ (o el emoji
// elegido). Se repinta con cada cambio de tema; favicon.svg queda
// como fallback estático para el primer arranque.
export function paintFavicon({ accent, accentFg, emoji }) {
  try {
    const size = 64
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')
    if (!ctx) return

    const r = 16
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.arcTo(size, 0, size, size, r)
    ctx.arcTo(size, size, 0, size, r)
    ctx.arcTo(0, size, 0, 0, r)
    ctx.arcTo(0, 0, size, 0, r)
    ctx.closePath()
    ctx.fillStyle = `hsl(${accent})`
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (emoji) {
      ctx.font = '38px sans-serif'
      ctx.fillText(emoji, size / 2, size / 2 + 3)
    } else {
      ctx.fillStyle = `hsl(${accentFg})`
      ctx.font = '700 40px system-ui, sans-serif'
      ctx.fillText('Σ', size / 2, size / 2 + 2)
    }

    let link = document.querySelector('link[rel="icon"][type="image/png"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      document.head.appendChild(link)
    }
    link.href = c.toDataURL('image/png')
  } catch {
    // sin canvas (SSR/tests): se queda el favicon estático
  }
}
