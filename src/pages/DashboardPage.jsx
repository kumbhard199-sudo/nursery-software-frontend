import { useQuery } from '@tanstack/react-query';
import { Alert } from '../components/ui/Alert';
import { fmtMoney, fmtNumber } from '../utils/format';
import * as reportsApi from '../services/reports';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

/* ─── Static chart data ────────────────────────────────────── */
const MONTHLY_REVENUE = [
  { month: 'Nov', revenue: 68000 },
  { month: 'Dec', revenue: 92000 },
  { month: 'Jan', revenue: 75000 },
  { month: 'Feb', revenue: 110000 },
  { month: 'Mar', revenue: 88000 },
  { month: 'Apr', revenue: 126000 },
];

const ACTIVITY = [
  { icon: '🌿', text: 'New batch B-044 created', sub: 'Rose Saplings — 500 units', time: '10 min ago', color: '#2d6a4f' },
  { icon: '💰', text: 'Sale recorded to Ramesh & Co.', sub: '₹14,250 — Batch B-041', time: '42 min ago', color: '#d4a373' },
  { icon: '👷', text: 'Worker attendance updated', sub: '18 / 20 workers present', time: '1 hr ago', color: '#e9c46a' },
  { icon: '🚚', text: 'Travelling cost added', sub: 'Vehicle #TN09 — ₹1,800', time: '3 hrs ago', color: '#a98467' },
  { icon: '📋', text: 'Monthly report generated', sub: 'March 2025 summary ready', time: 'Yesterday', color: '#52b788' },
];

/* ─── Skeleton Cards ───────────────────────────────────────── */
function StatSkeleton() {
  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-12 w-12 rounded-2xl" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-8 w-24 rounded-lg mb-2" />
      <div className="skeleton h-4 w-32 rounded" />
    </div>
  );
}

function ChartSkeleton({ height = 220 }) {
  return <div className="skeleton rounded-xl" style={{ height }} />;
}

/* ─── Stat Card ────────────────────────────────────────────── */
function StatCard({ title, value, sub, icon, gradient, glowColor, badge, delay = 0 }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 cursor-default animate-fadeInUp"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-color)',
        boxShadow: `var(--shadow-sm), 0 0 0 1px ${glowColor}22`,
        animationDelay: `${delay}ms`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `var(--shadow-lg), 0 0 0 1px ${glowColor}44`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `var(--shadow-sm), 0 0 0 1px ${glowColor}22`;
      }}
    >
      {/* Gradient blob */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-[0.12]"
        style={{ background: gradient }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm"
            style={{ background: gradient }}
          >
            {icon}
          </div>
          {badge && (
            <span
              className="rounded-full px-2 py-0.5 text-white text-xs font-bold"
              style={{ background: glowColor, fontSize: '0.62rem' }}
            >
              {badge}
            </span>
          )}
        </div>

        <div
          className="text-3xl font-extrabold tracking-tight animate-countUp"
          style={{ color: 'var(--text-primary)', animationDelay: `${delay + 100}ms`, letterSpacing: '-0.02em' }}
        >
          {value}
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 4 }}>{title}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Quick Action ─────────────────────────────────────────── */
function QuickAction({ href, icon, label, description, gradient }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-2xl border p-4 cursor-pointer"
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-color)',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = '#52b788';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ background: gradient, transition: 'transform 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0)'; }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>{description}</div>
      </div>
      <div className="ml-auto" style={{ color: 'var(--text-muted)', transition: 'transform 0.2s ease' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="group-hover:translate-x-1 transition-transform">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </a>
  );
}

/* ─── Custom Tooltip ───────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border px-4 py-3 shadow-lg" style={{ background: 'var(--surface-card)', borderColor: '#52b788' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2d6a4f' }}>{fmtMoney(payload[0].value)}</div>
      </div>
    );
  }
  return null;
}

/* ─── Dashboard Page ───────────────────────────────────────── */
export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: reportsApi.getDashboardStats,
  });

  const stats = data?.data?.stats;
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor  = isDark ? '#1e4d32' : '#d8f3dc';
  const axisColor  = isDark ? '#52b788' : '#95d5b2';
  const barColor   = '#2d6a4f';
  const pieColors  = isDark ? ['#52b788', '#1e4d32'] : ['#2d6a4f', '#b7e4c7'];

  const batchTotal    = stats?.batches?.total || 0;
  const batchActive   = stats?.batches?.active || 0;
  const batchInactive = Math.max(0, batchTotal - batchActive);
  const pieData = [
    { name: 'Active',   value: batchActive || 1 },
    { name: 'Inactive', value: batchInactive || 0 },
  ];

  /* ── Loading Skeleton ── */
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <div className="skeleton h-7 w-52 rounded-lg mb-2" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(i => <StatSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border p-5" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
            <div className="skeleton h-5 w-40 rounded mb-4" />
            <ChartSkeleton height={220} />
          </div>
          <div className="rounded-2xl border p-5" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
            <div className="skeleton h-5 w-32 rounded mb-4" />
            <ChartSkeleton height={220} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fadeIn">
        <Alert variant="danger" title="Failed to load dashboard">{error.message}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="animate-fadeInUp flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Good morning 🌿
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
            Here's what's growing at your nursery today.
          </p>
        </div>
        {/* Today's date badge */}
        <div
          className="hidden sm:flex items-center gap-2 rounded-2xl px-4 py-2"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-color)' }}
        >
          <span style={{ fontSize: '1.1rem' }}>📅</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Batches"
          value={fmtNumber(stats?.batches?.total)}
          sub={`Active: ${fmtNumber(stats?.batches?.active)}`}
          icon="🌱"
          gradient="linear-gradient(135deg, #081c15, #2d6a4f)"
          glowColor="#2d6a4f"
          badge="Batches"
          delay={0}
        />
        <StatCard
          title="Total Customers"
          value={fmtNumber(stats?.customers?.total)}
          sub="All registered customers"
          icon="👥"
          gradient="linear-gradient(135deg, #52b788, #95d5b2)"
          glowColor="#52b788"
          badge="Customers"
          delay={80}
        />
        <StatCard
          title="Total Workers"
          value={fmtNumber(stats?.workers?.total)}
          sub={`Present today: ${fmtNumber(stats?.workers?.presentToday)}`}
          icon="👷"
          gradient="linear-gradient(135deg, #d4a373, #e9c46a)"
          glowColor="#d4a373"
          badge="Workers"
          delay={160}
        />
        <StatCard
          title="Monthly Revenue"
          value={fmtMoney(stats?.revenue?.thisMonth)}
          sub={`Month ${stats?.revenue?.month} / ${stats?.revenue?.year}`}
          icon="💰"
          gradient="linear-gradient(135deg, #a98467, #d4a373)"
          glowColor="#a98467"
          badge="Revenue"
          delay={240}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 animate-fadeInUp" style={{ animationDelay: '200ms' }}>

        {/* Bar Chart — Revenue */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Revenue Overview</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>Last 6 months</div>
            </div>
            <div
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: 'rgb(45 106 79 / 0.1)', color: '#2d6a4f' }}
            >
              🌱 Trending ↑
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_REVENUE} barSize={32} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: axisColor, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgb(45 106 79 / 0.06)', radius: 6 }} />
              <Bar dataKey="revenue" fill={barColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Batch Status */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="mb-2">
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Batch Status</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>Active vs Inactive</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={76}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip
                formatter={(value, name) => [fmtNumber(value), name]}
                contentStyle={{
                  background: 'var(--surface-card)', border: '1px solid var(--border-color)',
                  borderRadius: 12, fontSize: 12, color: 'var(--text-primary)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: pieColors[i] }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fmtNumber(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Quick Actions + Activity ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-fadeInUp" style={{ animationDelay: '300ms' }}>

        {/* Quick Actions */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
          <div className="mb-4">
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Quick Actions 🚀</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>Common operations</div>
          </div>
          <div className="space-y-3">
            <QuickAction href="/app/batches" icon="🌿" label="Create a Batch" description="Register new plant batch"
              gradient="linear-gradient(135deg, #d8f3dc, #b7e4c7)" />
            <QuickAction href="/app/sales" icon="💰" label="Record a Sale" description="Log a customer transaction"
              gradient="linear-gradient(135deg, #fef3c7, #fde68a)" />
            <QuickAction href="/app/workers" icon="👷" label="Manage Workers" description="Update attendance & wages"
              gradient="linear-gradient(135deg, #fed7aa, #fbbf24)" />
            <QuickAction href="/app/reports" icon="📊" label="View Reports" description="Profit summaries & analytics"
              gradient="linear-gradient(135deg, #e0f2fe, #bae6fd)" />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Recent Activity</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>Latest operations</div>
            </div>
            <div
              className="flex h-2.5 w-2.5 items-center justify-center rounded-full"
              style={{ background: '#52b788', boxShadow: '0 0 0 4px rgb(82 183 136 / 0.25)', animation: 'pulse-ring 2s infinite' }}
            />
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-[19px] top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, #52b788, transparent)' }}
            />
            <div className="space-y-4">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{ background: `${item.color}18`, border: `2px solid ${item.color}30` }}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
                    <div
                      className="mt-1 inline-flex rounded-full px-2 py-0.5"
                      style={{ fontSize: '0.62rem', fontWeight: 700, background: `${item.color}18`, color: item.color }}
                    >
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
