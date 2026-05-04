import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../services/auth';
import * as systemApi from '../services/system';

/* ── Small stat info box ── */
function InfoBox({ label, value, sub }) {
  return (
    <div
      className="rounded-2xl border p-4 transition-all duration-200 hover:shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #f0f9f4, #f8fffe)',
        borderColor: 'var(--border-color)',
        borderLeft: '3px solid #52b788',
      }}
    >
      <div
        className="text-xs font-bold uppercase tracking-wider mb-2"
        style={{ color: 'var(--brand-primary)' }}
      >
        {label}
      </div>
      <div className="font-extrabold" style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>
        {value || '—'}
      </div>
      {sub && (
        <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { admin, refreshMe, logout } = useAuth();
  const [notice, setNotice] = useState('');
  const [error, setError]   = useState('');

  const healthQ = useQuery({ queryKey: ['health'],    queryFn: systemApi.getHealth });
  const rootQ   = useQuery({ queryKey: ['rootInfo'],  queryFn: systemApi.getRootInfo });

  const { register, handleSubmit, formState } = useForm({
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: async () => {
      setError('');
      setNotice('Password updated. Please sign in again.');
      setTimeout(() => { logout(); window.location.assign('/login'); }, 800);
      await refreshMe();
    },
    onError: e => {
      setNotice('');
      setError(e?.message || 'Failed to update password');
    },
  });

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Profile card ── */}
      <Card title="👤 Profile" description="Current admin session">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #2d6a4f, #52b788)', boxShadow: '0 4px 14px rgb(45 106 79 / 0.3)' }}
          >
            {admin?.username ? admin.username.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div>
            <div className="font-extrabold text-base" style={{ color: 'var(--brand-primary)' }}>
              {admin?.username || '—'}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Administrator 🌱</div>
            <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Use "Change password" below to rotate credentials.
            </div>
          </div>
        </div>
      </Card>

      {/* ── Backend status ── */}
      <Card title="🔌 Backend Status" description="Connection and service info.">
        {healthQ.error ? (
          <Alert variant="danger" title="Health check failed">{healthQ.error.message}</Alert>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoBox
              label="Health"
              value={healthQ.data?.success ? '✅ OK' : '—'}
              sub={healthQ.data?.timestamp || '—'}
            />
            <InfoBox
              label="API"
              value={rootQ.data?.message || '—'}
              sub={`Version ${rootQ.data?.version || '—'}`}
            />
          </div>
        )}
      </Card>

      {/* ── Change password ── */}
      <Card title="🔑 Change Password" description="Update your admin password.">
        {notice ? <Alert className="mb-4" variant="success" title="Done">{notice}</Alert> : null}
        {error  ? <Alert className="mb-4" variant="danger"  title="Error">{error}</Alert>  : null}
        <form
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(values => mutation.mutate(values))}
        >
          <Input
            label="Current password"
            type="password"
            error={formState.errors.currentPassword?.message}
            {...register('currentPassword', { required: 'Required' })}
          />
          <Input
            label="New password"
            type="password"
            hint="Minimum 8 chars, includes a number"
            error={formState.errors.newPassword?.message}
            {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
          />
          <div className="md:col-span-2">
            <Button isLoading={mutation.isPending} type="submit">
              🔐 Update Password
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
}
