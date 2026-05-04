import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useState } from 'react';

export function SetupPage() {
  const { setup } = useAuth();
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { username: '', password: '' } });

  async function onSubmit(values) {
    setError('');
    setNotice('');
    try {
      await setup(values);
      setNotice('Admin created. You can now sign in.');
      setTimeout(() => navigate('/login'), 800);
    } catch (e) {
      setError(e?.message || 'Setup failed');
    }
  }

  return (
    <div
      className="min-h-dvh leaf-bg animate-fadeIn flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--surface-bg)' }}
    >
      <div className="w-full max-w-[480px]">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)', boxShadow: '0 6px 20px rgb(45 106 79 / 0.35)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 6 5 10 5 14a7 7 0 0 0 14 0c0-4-3-8-7-12z"/>
              <line x1="12" y1="14" x2="12" y2="22"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>Nursery Suite</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Management System</div>
          </div>
        </div>

        <div
          className="w-full rounded-3xl border p-7 shadow-lg sm:p-10 animate-fadeInUp"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--border-color)',
            borderTop: '4px solid #52b788',
          }}
        >
          <div className="text-xl font-extrabold mb-1" style={{ color: 'var(--brand-primary)' }}>
            🌱 Initial Setup
          </div>
          <div className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Creates the first admin account (backend allows one-time setup).
          </div>

          {notice ? <Alert className="mb-4" variant="success" title="Success">{notice}</Alert> : null}
          {error  ? <Alert className="mb-4" variant="danger"  title="Setup failed">{error}</Alert>  : null}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Username"
              placeholder="letters, numbers, underscores"
              error={errors.username?.message}
              {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 chars' } })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 chars, includes a number"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 chars' } })}
            />
            <Button className="w-full" isLoading={isSubmitting} type="submit" size="lg">
              🌿 Create Admin Account
            </Button>
          </form>

          <div className="mt-5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link
              className="font-bold hover:underline"
              style={{ color: 'var(--brand-primary)' }}
              to="/login"
            >
              Back to login
            </Link>
          </div>

          <div className="mt-6 h-1 w-12 rounded-full mx-auto" style={{ background: 'linear-gradient(90deg, #2d6a4f, #95d5b2)' }} />
        </div>
      </div>
    </div>
  );
}
