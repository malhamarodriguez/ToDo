# Summa

**Panel personal todo‑en‑uno para autónomos y emprendedores.** Negocio, finanzas,
deporte y objetivos en un solo sitio, con foco absoluto en _lo de hoy_.

App web responsive (móvil y escritorio) construida con **React + Vite + Tailwind**,
iconos **Lucide** y gráficas **Recharts**. Modo oscuro por defecto con modo claro,
acento configurable y **dos direcciones visuales** intercambiables.

Datos **sincronizados entre dispositivos** con **Supabase** (login + base de datos)
y despliegue en **GitHub Pages**. La app arranca **vacía**: cada quien rellena su
información. 👉 **Sigue [`SETUP.md`](./SETUP.md) para publicarla con tu URL.**

```bash
cp .env.example .env.local   # pon tus credenciales de Supabase
npm install      # instalar dependencias
npm run dev      # desarrollo (http://localhost:5173)
npm run build    # producción → dist/
npm run preview  # previsualizar el build

npm run build:single  # genera dist-single/index.html — un único archivo
                      # autocontenido (JS, CSS y fuentes embebidas) que se
                      # abre con doble clic vía file:// sin servidor.
```

---

## Sistema de diseño y personalización

Todo el sistema vive en tokens (variables CSS) definidos en `src/index.css`,
resueltos por el **motor de temas** (`src/lib/theme.js`) y expuestos a Tailwind
en `tailwind.config.js`. El look por defecto es **Eléctrico** (Electric Kinetic:
obsidiana + cian con glow, Geist + JetBrains Mono).

### Presets

Un preset es un tema completo — superficies, texto, acento, rampa de datos
(`--viz-1…6`), fuente, radios, sombras y fondo — con variante clara y oscura:

`Eléctrico` (serie) · `Ejecutivo` · `Noche` · `Papel` · `Bosque` · `Terminal` ·
`Alto contraste` · `Amanecer` · `Tinta` · `Neón`

Sobre el preset, el usuario puede afinar TODO desde Ajustes: acento (global y
por módulo), colores exactos con aviso de contraste WCAG AA, 9 tipografías
(carga bajo demanda), tamaño S/M/L/XL, peso de titulares, radio 0–20px, grosor
de bordes, estilo de sombras, densidad (escala `--space` en todo el spacing),
animaciones, 5 fondos, nombre e icono de la instancia, saludo con variables,
módulos con drag & drop + emoji, widgets del Inicio reordenables, formatos
(números, hora 12/24, semana, divisa), prioridades renombrables, unidades,
estilo de progreso de metas y lectura del diario. "Sorpréndeme" genera temas
aleatorios con armonía real, y los temas se exportan/importan como JSON con
validación estricta.

Los ajustes se guardan en `summa:settings` (con `schemaVersion` y migraciones)
y sincronizan con la nube; la resolución final del tema se cachea en
`summa:boot-theme` para aplicarse antes del primer pintado (sin FOUC).

### Tokens

Superficies por capas: `bg → surface → surface-2 → elevated`, bordes `line` /
`line-strong` (grosor `--border-w`), texto `ink` / `muted` / `subtle`,
semánticos `success` `warning` `danger` `info`, acento `--accent`/`--accent-fg`
y rampa categórica `--viz-1…6` para datos. Sombras `xs…xl` + `glow`; radios
derivados de `--radius`; espaciado Tailwind en `calc()` sobre `--space`.

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
