'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Line,
  LineChart,
} from 'recharts'

const COLORS = ['#0ea5e9', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#6366f1']

export function SalesAreaChart({ data }: { data: { name: string; revenue: number; orders: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.25)',
              background: 'rgba(15,23,42,0.92)',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#revGrad)" />
          <Area type="monotone" dataKey="orders" stroke="#a855f7" strokeWidth={2.5} fill="url(#ordGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopProductsBarChart({ data }: { data: { name: string; sold: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.25)',
              background: 'rgba(15,23,42,0.92)',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Bar dataKey="sold" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={55} outerRadius={95} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.25)',
              background: 'rgba(15,23,42,0.92)',
              color: '#fff',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ConversionLine({ data }: { data: { name: string; rate: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.25)',
              background: 'rgba(15,23,42,0.92)',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
