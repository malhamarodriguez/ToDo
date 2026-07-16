// ============================================================
// Migración de marca: Núcleo → Summa (claves de localStorage).
// Copia cada clave antigua `nucleo:*` a su equivalente `summa:*`
// SOLO si la nueva no existe todavía. Las antiguas NO se borran
// (retirada prevista en una versión futura, cuando la migración
// lleve tiempo desplegada). Debe ejecutarse antes de que la app
// lea cualquier ajuste — se importa la primera en main.jsx.
// ============================================================
const KEYS = ['settings', 'demo', 'demo-data', 'sb_url', 'sb_key']

try {
  KEYS.forEach((k) => {
    const oldValue = localStorage.getItem(`nucleo:${k}`)
    if (oldValue !== null && localStorage.getItem(`summa:${k}`) === null) {
      localStorage.setItem(`summa:${k}`, oldValue)
    }
  })
} catch {
  // localStorage inaccesible (modo incógnito extremo, etc.): sin efecto.
}
