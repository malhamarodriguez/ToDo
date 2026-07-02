/* Núcleo · service worker
   - Navegaciones e index: red primero (para recibir versiones nuevas),
     con caché de respaldo si no hay conexión.
   - Recursos estáticos (js/css/fuentes/iconos): caché primero.
   - Nunca toca peticiones a otros orígenes (Supabase va siempre a red). */
const VERSION = 'nucleo-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(VERSION).then((c) => c.put(req, copy))
          return res
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    )
    return
  }

  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(VERSION).then((c) => c.put(req, copy))
          }
          return res
        })
    )
  )
})
