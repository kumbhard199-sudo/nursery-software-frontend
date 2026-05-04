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
import * as batchesApi from '../../services/batches';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function BatchesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ['batches'],
    queryFn: batchesApi.listBatches,
  });

  const createForm = useForm({
    defaultValues: { batchName: '', cropType: '', totalProduced: '', notes: '' },
  });

  const createMutation = useMutation({
    mutationFn: batchesApi.createBatch,
    onSuccess: async res => {
      setError('');
      setCreateOpen(false);
      createForm.reset();
      await qc.invalidateQueries({ queryKey: ['batches'] });
      const id = res?.data?.batch?.id;
      if (id) navigate(`/app/batches/${id}`);
    },
    onError: e => setError(e?.message || 'Failed to create batch'),
  });

  const deleteMutation = useMutation({
    mutationFn: batchesApi.deleteBatch,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['batches'] }),
  });

  const rows = data?.data?.batches || [];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(b => `${b.batchName} ${b.cropType}`.toLowerCase().includes(s));
  }, [rows, q]);

  const columns = [
    { key: 'batchName', header: 'Batch' },
    { key: 'cropType', header: 'Crop type' },
    { key: 'totalProduced', header: 'Produced', render: r => fmtNumber(r.totalProduced) },
    { key: 'deadCrops', header: 'Dead', render: r => fmtNumber(r.deadCrops) },
    { key: 'soldCrops', header: 'Sold', render: r => fmtNumber(r.soldCrops) },
    { key: 'remainingCrops', header: 'Remaining', render: r => fmtNumber(r.remainingCrops) },
    { key: 'createdDate', header: 'Created', render: r => fmtDate(r.createdDate) },
    {
      key: 'actions',
      header: '',
      render: r => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={e => (e.stopPropagation(), navigate(`/app/batches/${r.id}`))}>
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async e => {
              e.stopPropagation();
              const ok = await confirm({
                title: 'Delete batch?',
                message: 'This will permanently delete the batch. Deletion will fail if it already has sales.',
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
      className: 'text-right',
      tdClassName: 'text-right',
    },
  ];

  if (isLoading) return <Loader label="Loading batches…" />;
  if (loadError) return <Alert variant="danger" title="Failed to load batches">{loadError.message}</Alert>;

  return (
    <div className="space-y-4">
      <Card
        title="Batch management"
        description="Create, track, and manage production batches."
        actions={<Button onClick={() => setCreateOpen(true)}>Create batch</Button>}
      >
        {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchFilter value={q} onChange={setQ} placeholder="Search batches by name or crop type…" className="w-full md:max-w-sm" />
          <div className="text-xs text-slate-500">{filtered.length} of {rows.length}</div>
        </div>
        <div className="mt-4">
          <Table
            columns={columns}
            rows={filtered}
            rowKey="id"
            onRowClick={row => navigate(`/app/batches/${row.id}`)}
          />
        </div>
      </Card>

      <Modal
        open={createOpen}
        title="Create batch"
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
          <Input label="Batch name" error={createForm.formState.errors.batchName?.message} {...createForm.register('batchName', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} />
          <Input label="Crop type" error={createForm.formState.errors.cropType?.message} {...createForm.register('cropType', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} />
          <Input label="Total produced" type="number" min="1" error={createForm.formState.errors.totalProduced?.message} {...createForm.register('totalProduced', { required: 'Required' })} />
          <Input label="Notes (optional)" {...createForm.register('notes')} />
          <button type="submit" className="hidden" />
        </form>
      </Modal>
      {ConfirmDialog}
    </div>
  );
}

