import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatINR } from '../../utils/formatters';

export const CHART = { deep: '#5E7F62', base: '#A8C3A8', tint: '#E3EDE4', peach: '#E9B99A', grid: '#EFE9DF', text: '#7A756C' };

const tooltipStyle = { borderRadius: 10, border: '1px solid #E8E1D6', boxShadow: '0 6px 20px rgba(60,45,20,.08)', fontSize: 13 };

export function MoneyBarChart({ data, dataKey = 'amount', height = 260 }: { data: Record<string, string | number>[]; dataKey?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
        <Tooltip cursor={{ fill: CHART.tint }} contentStyle={tooltipStyle} formatter={(v: number) => [formatINR(v), 'Earnings']} />
        <Bar dataKey={dataKey} fill={CHART.deep} radius={[6, 6, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendAreaChart({ data, dataKey, label, money = false, height = 240 }: { data: Record<string, string | number>[]; dataKey: string; label: string; money?: boolean; height?: number }) {
  const id = `grad-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.base} stopOpacity={0.5} />
            <stop offset="100%" stopColor={CHART.base} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} allowDecimals={false} tickFormatter={(v) => (money ? `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}` : String(v))} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [money ? formatINR(v) : v, label]} />
        <Area type="monotone" dataKey={dataKey} stroke={CHART.deep} strokeWidth={2} fill={`url(#${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
