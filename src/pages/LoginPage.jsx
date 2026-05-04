import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useState } from 'react';

/* ─── Floating leaf SVG ──────────────────────────────────── */
function FloatLeaf({ style = {} }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <path d="M30 5 C20 15, 10 25, 20 42 C25 52, 38 55, 46 47 C58 35, 52 12, 30 5Z"
        fill="currentColor" opacity="0.22"/>
      <path d="M30 5 L30 50" stroke="currentColor" strokeWidth="1.2" opacity="0.3" strokeDasharray="4 4"/>
    </svg>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { username: '', password: '' } });

  async function onSubmit(values) {
    setError('');
    try {
      await login(values);
      navigate('/app');
    } catch (e) {
      setError(e?.message || 'Login failed');
    }
  }

  return (
    <div
      className="min-h-dvh leaf-bg animate-fadeIn"
      style={{ background: 'var(--surface-bg)' }}
    >
      <div className="mx-auto flex min-h-dvh max-w-[1100px] items-center justify-center px-4 py-10">
        <div
          className="grid w-full overflow-hidden rounded-3xl shadow-xl"
          style={{
            gridTemplateColumns: 'repeat(1, 1fr)',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-card)',
          }}
        >
          <style>{`@media (min-width:1024px){.login-grid{grid-template-columns:1fr 1fr!important}}`}</style>
          <div className="login-grid grid w-full overflow-hidden rounded-3xl" style={{ gridTemplateColumns: '1fr' }}>

            {/* ── Left panel — Forest ── */}
            <div
              className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #081c15 0%, #1b4332 45%, #2d6a4f 100%)',
                minHeight: 480,
              }}
            >
              {/* Leaf decorations */}
              <FloatLeaf style={{ top: -20, right: -10, width: 160, color: '#52b788', animation: 'leafSway 6s ease-in-out infinite' }} />
              <FloatLeaf style={{ bottom: 20, left: -20, width: 130, color: '#95d5b2', transform: 'rotate(150deg)', animation: 'leafSway 8s ease-in-out infinite reverse' }} />
              <FloatLeaf style={{ top: '40%', left: '60%', width: 80, color: '#d4a373', opacity: 0.6, transform: 'rotate(60deg)' }} />

              {/* Brand */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #e9c46a, #d4a373)', boxShadow: '0 6px 20px rgb(212 163 115 / 0.5)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8 6 5 10 5 14a7 7 0 0 0 14 0c0-4-3-8-7-12z"/>
                      <line x1="12" y1="14" x2="12" y2="22"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ color: '#d8f3dc', fontWeight: 800, fontSize: '1.1rem' }}>Nursery</div>
                    <div style={{ color: 'rgba(149,213,178,0.7)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Management Suite</div>
                  </div>
                </div>

                <h1 style={{ color: '#d8f3dc', fontWeight: 800, fontSize: '1.75rem', lineHeight: 1.25, marginBottom: 12 }}>
                  Grow your nursery<br />like a modern business.
                </h1>
                <p style={{ color: 'rgba(149,213,178,0.75)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Batches, sales, customers, workers, expenses and reports — all in one beautiful dashboard.
                </p>
              </div>

              {/* Feature pills */}
              <div className="relative z-10 flex flex-wrap gap-2 mt-6">
                {['🌱 Batch Tracking', '💰 Sales & Revenue', '👥 Customer CRM', '📊 Reports', '👷 Worker Mgmt'].map(f => (
                  <span
                    key={f}
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: 'rgba(82,183,136,0.18)', color: '#95d5b2', border: '1px solid rgba(82,183,136,0.25)' }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Bottom stat strip */}
              <div
                className="relative z-10 mt-6 grid grid-cols-3 gap-3 rounded-2xl p-4"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(82,183,136,0.2)' }}
              >
                {[
                  { num: '500+', label: 'Batches tracked' },
                  { num: '₹12L', label: 'Revenue managed' },
                  { num: '200+', label: 'Happy customers' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div style={{ color: '#e9c46a', fontWeight: 800, fontSize: '1.1rem' }}>{s.num}</div>
                    <div style={{ color: 'rgba(149,213,178,0.65)', fontSize: '0.65rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right panel — Login form ── */}
            <div
              className="flex flex-col justify-center p-7 sm:p-10"
              style={{ background: 'var(--surface-card)' }}
            >
              {/* Mobile brand */}
              <div className="flex items-center gap-2 mb-6 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8 6 5 10 5 14a7 7 0 0 0 14 0c0-4-3-8-7-12z"/>
                    <line x1="12" y1="14" x2="12" y2="22"/>
                  </svg>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>Nursery Suite</span>
              </div>

              <div className="mb-2 text-2xl font-extrabold" style={{ color: 'var(--brand-primary)', letterSpacing: '-0.02em' }}>
                Welcome back 🌿
              </div>
              <div className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                Sign in with your admin credentials to continue.
              </div>

              {error ? <Alert className="mb-4" variant="danger" title="Login failed">{error}</Alert> : null}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  label="Username"
                  placeholder="e.g. admin"
                  autoComplete="username"
                  error={errors.username?.message}
                  {...register('username', { required: 'Username is required' })}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password', { required: 'Password is required' })}
                />
                <Button className="w-full mt-2" isLoading={isSubmitting} type="submit" size="lg">
                  🌿 Sign in to Dashboard
                </Button>
              </form>

              <div className="mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
                First time setup?{' '}
                <Link
                  className="font-bold hover:underline"
                  style={{ color: 'var(--brand-primary)' }}
                  to="/setup"
                >
                  Create initial admin
                </Link>
              </div>

              {/* Decorative bottom border */}
              <div
                className="mt-8 h-1 w-16 rounded-full"
                style={{ background: 'linear-gradient(90deg, #2d6a4f, #95d5b2)' }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
