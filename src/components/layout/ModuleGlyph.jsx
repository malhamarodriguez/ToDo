import { ICONS } from './icons'
import { moduleIcon, moduleEmoji } from '../../lib/data'

// Glifo de un módulo: icono Lucide del set o emoji elegido por el usuario.
export function ModuleGlyph({ settings, id, size = 19, strokeWidth = 2, className }) {
  const emoji = moduleEmoji(settings, id)
  if (emoji) {
    return (
      <span
        className={className}
        aria-hidden
        style={{ fontSize: size - 2, lineHeight: 1, width: size, display: 'inline-grid', placeItems: 'center' }}
      >
        {emoji}
      </span>
    )
  }
  const Icon = ICONS[moduleIcon(settings, id)]
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />
}
