import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useThemeColors, ChartTooltip } from './useThemeColors'
import { uid } from '../../lib/utils'

const axisProps = (c) => ({
  tick: { fill: c.axis, fontSize: 10.5, fontWeight: 500, fontFamily: c.fontMono },
  tickLine: false,
  axisLine: false,
})

export function Sparkline({ data, dataKey = 'v', color, height = 40, type = 'area' }) {
  const c = useThemeColors()
  const stroke = color || c.accent
  const gid = `spark-${dataKey}-${color || 'acc'}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'area' ? (
        <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} fill={`url(#${gid})`} />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
          <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} />
        </LineChart>
      )}
    </ResponsiveContainer>
  )
}

export function TrendArea({ data, xKey = 'm', series = [], fmt, height = 240, grid = true }) {
  const c = useThemeColors()
  const ids = series.map(() => uid())
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={ids[i]} id={ids[i]} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color || c.accent} stopOpacity={s.fill ?? 0.22} />
              <stop offset="100%" stopColor={s.color || c.accent} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {grid && <CartesianGrid stroke={c.grid} vertical={false} />}
        <XAxis dataKey={xKey} {...axisProps(c)} dy={6} />
        <YAxis {...axisProps(c)} width={48} tickFormatter={(v) => (fmt ? fmt(v) : v)} />
        <Tooltip cursor={{ stroke: c.border }} content={<ChartTooltip fmt={fmt} />} />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color || c.accent}
            strokeWidth={2}
            fill={`url(#${ids[i]})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: c.surface }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function GroupedBars({ data, xKey = 'm', series = [], fmt, height = 240 }) {
  const c = useThemeColors()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barGap={6}>
        <CartesianGrid stroke={c.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps(c)} dy={6} />
        <YAxis {...axisProps(c)} width={48} tickFormatter={(v) => (fmt ? fmt(v) : v)} />
        <Tooltip cursor={{ fill: c.accentSoft }} content={<ChartTooltip fmt={fmt} />} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || c.accent} radius={[4, 4, 0, 0]} maxBarSize={26} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data, fmt, height = 200, inner = 58, outer = 84, children }) {
  const c = useThemeColors()
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={inner}
            outerRadius={outer}
            paddingAngle={2}
            stroke={c.surface}
            strokeWidth={2}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color ? `hsl(${d.color})` : c.accent} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip fmt={fmt} />} />
        </PieChart>
      </ResponsiveContainer>
      {children && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          {children}
        </div>
      )}
    </div>
  )
}
