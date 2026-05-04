import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Loader } from '../../components/ui/Loader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { fmtDate, fmtNumber } from '../../utils/format';
import * as workersApi from '../../services/workers';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function WorkersPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const listQ = useQuery({ queryKey: ['workers'], queryFn: workersApi.listWorkers });
  const rows = listQ.data?.data?.workers || [];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => `${r.name} ${r.mobile}`.toLowerCase().includes(s));
  }, [rows, q]);

  const createForm = useForm({ defaultValues: { name: '', mobile: '' } });
  const createMutation = useMutation({
    mutationFn: workersApi.createWorker,
    onSuccess: async res => {
      setError('');
      setCreateOpen(false);
      createForm.reset();
      await qc.invalidateQueries({ queryKey: ['workers'] });
      const id = res?.data?.worker?.id;
      if (id) navigate(`/app/workers/${id}`);
    },
    onError: e => setError(e?.message || 'Failed to create worker'),
  });

  const deleteMutation = useMutation({
    mutationFn: workersApi.deleteWorker,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  });

  const columns = [
    { key: 'name', header: 'Worker' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'joinDate', header: 'Joined', render: r => fmtDate(r.joinDate) },
    { key: 'recent', header: 'Recent attendance', render: r => fmtNumber((r.attendance || []).length) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      tdClassName: 'text-right',
      render: r => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={e => (e.stopPropagation(), navigate(`/app/workers/${r.id}`))}>
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async e => {
              e.stopPropagation();
              const ok = await confirm({
                title: 'Delete worker?',
                message: 'This will permanently delete the worker. Deletion will fail if attendance records exist.',
                confirmText: 'Delete',
                variant: 'danger',
              });
              if (ok) deleteMutation.mutate(r.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card title="Workers" description="Manage workforce, attendance, and salary tracking." actions={<Button onClick={() => setCreateOpen(true)}>Add worker</Button>}>
        {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}
        {listQ.isLoading ? <Loader label="Loading workers…" /> : null}
        {listQ.error ? (
          <Alert variant="danger" title="Failed to load workers">
            {listQ.error.message}
          </Alert>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchFilter value={q} onChange={setQ} placeholder="Search workers…" className="w-full md:max-w-sm" />
          <div className="text-xs text-slate-500">{filtered.length} of {rows.length}</div>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={filtered} rowKey="id" onRowClick={r => navigate(`/app/workers/${r.id}`)} />
        </div>
      </Card>

      <Modal
        open={createOpen}
        title="Add worker"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={createMutation.isPending} onClick={createForm.handleSubmit(v => createMutation.mutate(v))}>
              Create
            </Button>
          </div>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createForm.handleSubmit(v => createMutation.mutate(v))}>
          <Input label="Name" {...createForm.register('name', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} />
          <Input label="Mobile number" placeholder="10 digits" {...createForm.register('mobile', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })} />
          <button type="submit" className="hidden" />
        </form>
      </Modal>
      {ConfirmDialog}
    </div>
  );
}

