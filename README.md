# Núcleo

**Panel personal todo‑en‑uno para autónomos y emprendedores.** Negocio, finanzas,
deporte y objetivos en un solo sitio, con foco absoluto en _lo de hoy_.

App web responsive (móvil y escritorio) construida con **React + Vite + Tailwind**,
iconos **Lucide** y gráficas **Recharts**. Modo oscuro por defecto con modo claro,
acento configurable y **dos direcciones visuales** intercambiables.

```bash
npm install      # instalar dependencias
npm run dev      # desarrollo (http://localhost:5173)
npm run build    # producción → dist/
npm run preview  # previsualizar el build
```

---

## Sistema de diseño

Todo el sistema vive en tokens (variables CSS) en `src/index.css` y se expone a
Tailwind en `tailwind.config.js`. Dos ejes lo gobiernan:

- **Modo:** `dark` · `light` · `system` (`data-mode`)
- **Dirección:** `eclipse` · `calido` (`data-direction`)
- **Acento:** configurable en tiempo real (`--accent`), con 10 presets + tono libre.

### Direcciones

| | **Eclipse** (por defecto) | **Cálido** |
|---|---|---|
| Personalidad | Frío, preciso, técnico | Editorial, sereno, humano |
| Superficies | Slate azulado (frío) | Graphite/papel templado (cálido) |
| Acento def. | Índigo `243 76% 64%` | Ámbar `36 92% 55%` |
| Display | Space Grotesk (geométrica) | Fraunces (serif) |
| Radio base | 14px | 18px |
| Sombra | Sutil + halo de acento | Difusa, sin halo |

> Referencia: _Linear / Vercel_ para Eclipse, _Notion_ para Cálido — con identidad propia.

### Paleta (tokens semánticos)

Neutros y superficies por capas (de fondo a elevado): `bg → surface → surface-2 →
elevated`, con `line` / `line-strong` para bordes y `ink` / `muted` / `subtle` para
texto. Cada combinación dirección × modo redefine estos valores en HSL.

```
Eclipse · oscuro     bg 222 24% 6%   surface 222 21% 9%   ink 210 30% 98%
Eclipse · claro      bg 220 32% 97%  surface 0 0% 100%    ink 222 38% 11%
Cálido · oscuro      bg 28 14% 6%    surface 30 11% 9%    ink 40 30% 97%
Cálido · claro       bg 40 38% 96%   surface 42 52% 99%   ink 28 28% 13%
```

Semánticos compartidos: `success` `warning` `danger` `info` + `accent` configurable.

### Tipografía

- **Sans / UI:** Hanken Grotesk (variable) — legible, con carácter.
- **Display / titulares:** Space Grotesk (Eclipse) o Fraunces (Cálido).
- Numerales tabulares (`.tabular`) para datos y finanzas.

### Escalas

- **Espaciado:** base 4px (Tailwind) con layouts generosos (`gutter` fluido).
- **Radios:** derivados de `--radius` → `sm … 3xl`.
- **Sombras:** `xs · sm · md · lg · xl · glow` (el `glow` tiñe con el acento).
- **Movimiento:** transiciones 150–300ms (`ease-smooth`, `ease-spring`) y animaciones
  de entrada (`fade-up`, `scale-in`, `toast-in`).

---

## Componentes

Librería en `src/components/ui/`:

- **Botones** — primario, secundario, outline, fantasma, soft, peligro · iconos · 5 tamaños
- **Tarjetas** — header/body/footer, hover, elevadas, inset
- **Indicadores / stats** — KPI con delta y sparkline
- **Listas** — fila de tarea con checkbox, prioridad, proyecto y etiquetas
- **Progreso** — barra y anillo (ring)
- **Gráficas** — área, barras agrupadas, donut y sparkline (Recharts, tema dinámico)
- **Tablas** — cabecera, zebra suave, alineación numérica
- **Formularios** — input, textarea, select, label con estados de foco/error
- **Modales**, **segmentos/tabs**, **badges/chips/dots**, **toggle**, **checkbox**
- **Estados vacíos** y **toasts** (sistema vía contexto)

---

## Módulos

1. **Inicio** — saludo + fecha, accesos rápidos, _Tareas de hoy_ como protagonista,
   toggle de entreno, próximos eventos, metas y franja discreta de balance/patrimonio.
2. **Negocio** — vista **Lista** y **Kanban** (Por hacer / En curso / Hecho) con
   _drag & drop_, proyectos con color, prioridades, subtareas y etiquetas Hoy/Atrasada.
3. **Finanzas** — KPIs, evolución de patrimonio, ingresos vs gastos, presupuestos,
   objetivos de ahorro, activos/pasivos, recurrentes, clientes y estimador de impuestos.
4. **Deporte** — rejilla de rachas (tipo GitHub), registro de entrenos, métricas
   corporales y logros.
5. **Metas** — objetivos por área, con tipo (porcentaje, numérico, proyecto) y progreso.
6. **Diario** — entradas por fecha + notas rápidas.
7. **Calendario** — vista mensual con eventos.
8. **Ajustes** — perfil, dirección visual, modo, acento, orden/visibilidad de módulos
   y copia de seguridad (export/import).

---

## Estructura

```
src/
  index.css              # tokens del sistema de diseño
  lib/        theme · utils · data (mock)
  context/    AppContext (tema, ruta, tareas, toasts)
  components/
    ui/        librería de componentes
    charts/    gráficas Recharts + hook de color de tema
    layout/    Sidebar · Topbar · MobileNav · AppShell · Logo · Page
    app/       NewTaskModal · TaskRow · Kanban
  pages/      Inicio · Negocio · Finanzas · Deporte · Metas · Diario · Calendario · Ajustes
```

La navegación usa el hash (`#/negocio`) y los ajustes persisten en `localStorage`.
