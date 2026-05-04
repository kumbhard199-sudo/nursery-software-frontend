import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/* ─── Nav Items ──────────────────────────────────────────── */
const nav = [
  {
    to: '/app',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    to: '/app/batches',
    label: 'Batches',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 6 5 10 5 14a7 7 0 0 0 14 0c0-4-3-8-7-12z"/>
      </svg>
    ),
  },
  {
    to: '/app/sales',
    label: 'Sales',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    to: '/app/customers',
    label: 'Customers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/app/reports',
    label: 'Reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    to: '/app/workers',
    label: 'Workers',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    to: '/app/expenses',
    label: 'Expenses',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/app/travelling-costs',
    label: 'Travel Costs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    ),
  },
  {
    to: '/app/settings',
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

function cx(...arr) { return arr.filter(Boolean).join(' '); }

/* ─── Dark Mode Hook ──────────────────────────────────────── */
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('nursery-dark') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('nursery-dark', dark); } catch { /* noop */ }
  }, [dark]);
  return [dark, setDark];
}

/* ─── Leaf SVG decoration ─────────────────────────────────── */
function LeafDecor({ style = {} }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M40 8 C28 20, 14 32, 22 54 C28 68, 44 72, 54 64 C68 52, 64 24, 40 8Z"
        fill="currentColor" opacity="0.18"/>
      <path d="M40 8 L40 64" stroke="currentColor" strokeWidth="1.5" opacity="0.25" strokeDasharray="4 3"/>
    </svg>
  );
}

/* ─── Main Layout ─────────────────────────────────────────── */
export function AppLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const title = useMemo(() => {
    const current = nav.find(n => location.pathname === n.to || location.pathname.startsWith(`${n.to}/`));
    return current?.label || 'Nursery';
  }, [location.pathname]);

  const titleIcon = useMemo(() => {
    const current = nav.find(n => location.pathname === n.to || location.pathname.startsWith(`${n.to}/`));
    return current?.icon || null;
  }, [location.pathname]);

  const initials = admin?.username
    ? admin.username.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100dvh', transition: 'background 0.3s' }}>
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[272px_1fr]">

        {/* ── Sidebar ── */}
        <div className={cx('lg:sticky lg:top-0 lg:h-dvh z-50', sidebarOpen ? 'block fixed inset-0 w-72' : 'hidden lg:block')}>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
              style={{ zIndex: -1 }}
            />
          )}

          <div
            className="ds-sidebar leaf-bg h-full flex flex-col relative overflow-hidden"
            style={{
              background: 'var(--surface-sidebar)',
              borderRight: '1px solid rgba(82,183,136,0.15)',
              transition: 'background 0.3s',
            }}
          >
            {/* Decorative leaf blobs */}
            <LeafDecor style={{ position: 'absolute', top: -20, right: -20, width: 120, color: '#52b788', pointerEvents: 'none' }} />
            <LeafDecor style={{ position: 'absolute', bottom: 60, left: -30, width: 100, color: '#95d5b2', pointerEvents: 'none', transform: 'rotate(140deg)' }} />

            {/* Brand */}
            <div className="relative flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-3">
                {/* Leaf logo */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl animate-leafSway"
                  style={{ background: 'linear-gradient(135deg, #e9c46a, #d4a373)', boxShadow: '0 4px 14px rgb(212 163 115 / 0.5)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8 6 5 10 5 14a7 7 0 0 0 14 0c0-4-3-8-7-12z"/>
                    <line x1="12" y1="14" x2="12" y2="22"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#d8f3dc', letterSpacing: '-0.01em' }}>
                    Nursery
                  </div>
                  <div style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: 'linear-gradient(90deg, #e9c46a, #95d5b2)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    Management Suite
                  </div>
                </div>
              </div>
              <button
                className="lg:hidden cursor-pointer rounded-lg p-1.5 transition hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
                style={{ color: '#95d5b2' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Nav section label */}
            <div className="px-5 pb-2 flex items-center gap-2">
              <div style={{ height: 1, flex: 1, background: 'rgba(149,213,178,0.2)' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(149,213,178,0.6)' }}>
                🌿 Menu
              </span>
              <div style={{ height: 1, flex: 1, background: 'rgba(149,213,178,0.2)' }} />
            </div>

            {/* Nav links */}
            <nav className="relative flex-1 overflow-y-auto px-3 pb-4">
              <div className="space-y-0.5">
                {nav.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => cx('nav-link', isActive && 'active')}
                    end={item.to === '/app'}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* User section */}
            <div
              className="relative border-t px-4 py-4"
              style={{ borderColor: 'rgba(82,183,136,0.2)', background: 'rgba(0,0,0,0.15)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #52b788, #2d6a4f)', boxShadow: '0 3px 10px rgb(82 183 136 / 0.4)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d8f3dc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {admin?.username || 'Admin'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(149,213,178,0.7)' }}>Administrator 🌱</div>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  title="Logout"
                  className="cursor-pointer shrink-0 rounded-xl p-2 transition"
                  style={{ color: 'rgba(149,213,178,0.6)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgb(239 68 68 / 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(149,213,178,0.6)'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="min-w-0">

          {/* ── Topbar ── */}
          <div
            className="ds-topbar sticky top-0 z-40 backdrop-blur"
            style={{
              background: 'var(--surface-topbar)',
              borderBottom: '1px solid var(--border-color)',
              transition: 'background 0.3s, border-color 0.3s',
            }}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">

              {/* Left: hamburger + title */}
              <div className="flex items-center gap-3">
                <button
                  className="cursor-pointer rounded-xl border p-2 lg:hidden transition hover:border-[#52b788]"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--surface-card)' }}
                  onClick={() => setSidebarOpen(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--brand-primary)' }}>{titleIcon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nursery Management Suite 🌿</div>
                  </div>
                </div>
              </div>

              {/* Right: search + actions */}
              <div className="flex items-center gap-2">

                {/* Search bar */}
                <div
                  className="hidden sm:flex items-center gap-2 rounded-xl border px-3 py-2 cursor-text transition-all duration-200"
                  style={{ borderColor: 'var(--border-color)', background: 'var(--surface-bg)', width: '200px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#52b788'; e.currentTarget.style.boxShadow = '0 0 0 3px rgb(45 106 79 / 0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Search…</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    className="cursor-pointer relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200"
                    style={{ borderColor: 'var(--border-color)', background: 'var(--surface-card)', color: 'var(--text-secondary)' }}
                    onClick={() => setNotifOpen(o => !o)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#52b788'; e.currentTarget.style.color = '#2d6a4f'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white"
                      style={{ fontSize: '0.58rem', fontWeight: 800, background: '#e11d48', animation: 'glowPulse 2s infinite' }}
                    >3</span>
                  </button>

                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                      <div
                        className="absolute right-0 top-11 z-40 w-72 rounded-2xl border shadow-xl animate-fadeIn"
                        style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)', borderTop: '3px solid #52b788' }}
                      >
                        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Notifications 🔔</span>
                          <span className="rounded-full px-2 py-0.5 text-white" style={{ fontSize: '0.65rem', fontWeight: 700, background: '#e11d48' }}>3 new</span>
                        </div>
                        {[
                          { icon: '🌱', text: 'Batch #B-042 ready for dispatch', time: '2m ago', color: '#2d6a4f' },
                          { icon: '💰', text: 'New sale recorded — ₹12,400', time: '18m ago', color: '#d4a373' },
                          { icon: '👷', text: '3 workers clocked in today', time: '1h ago', color: '#e9c46a' },
                        ].map((n, i) => (
                          <div
                            key={i}
                            className="flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-150"
                            style={{ borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-bg)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base" style={{ background: `${n.color}18` }}>
                              {n.icon}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Dark mode toggle */}
                <button
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200"
                  style={{ borderColor: 'var(--border-color)', background: 'var(--surface-card)', color: 'var(--text-secondary)' }}
                  onClick={() => setDark(d => !d)}
                  title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#52b788'; e.currentTarget.style.color = '#2d6a4f'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {dark ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>

                {/* Avatar */}
                <div
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-sm font-bold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)', boxShadow: '0 2px 8px rgb(45 106 79 / 0.35)' }}
                  title={admin?.username || 'Admin'}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 4px 14px rgb(45 106 79 / 0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgb(45 106 79 / 0.35)'; }}
                >
                  {initials}
                </div>
              </div>
            </div>
          </div>

          {/* ── Page Content ── */}
          <main className="px-4 py-6 lg:px-6 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
