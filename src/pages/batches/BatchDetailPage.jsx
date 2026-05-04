import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { fmtDate, fmtMoney, fmtNumber } from '../../utils/format';
import * as batchesApi from '../../services/batches';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function BatchDetailPage() {
  const { id } = useParams();
  const batchId = Number(id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const batchQ = useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => batchesApi.getBatch(batchId),
    enabled: Number.isFinite(batchId),
  });

  const stockQ = useQuery({
    queryKey: ['batchStock', batchId],
    queryFn: () => batchesApi.getBatchStock(batchId),
    enabled: Number.isFinite(batchId),
  });

  const salesSummaryQ = useQuery({
    queryKey: ['batchSalesSummary', batchId],
    queryFn: () => batchesApi.getBatchSalesSummary(batchId),
    enabled: Number.isFinite(batchId),
  });

  const updateForm = useForm({ defaultValues: { batchName: '', cropType: '', totalProduced: '', notes: '' } });
  const deadForm = useForm({ defaultValues: { deadCrops: '' } });

  const updateMutation = useMutation({
    mutationFn: payload => batchesApi.updateBatch(batchId, payload),
    onSuccess: async () => {
      setError('');
      await qc.invalidateQueries({ queryKey: ['batch', batchId] });
      await qc.invalidateQueries({ queryKey: ['batches'] });
      await qc.invalidateQueries({ queryKey: ['batchStock', batchId] });
      await qc.invalidateQueries({ queryKey: ['batchSalesSummary', batchId] });
    },
    onError: e => setError(e?.message || 'Failed to update batch'),
  });

  const deadMutation = useMutation({
    mutationFn: payload => batchesApi.updateDeadCrops(batchId, payload),
    onSuccess: async () => {
      setError('');
      deadForm.reset();
      await qc.invalidateQueries({ queryKey: ['batch', batchId] });
      await qc.invalidateQueries({ queryKey: ['batches'] });
      await qc.invalidateQueries({ queryKey: ['batchStock', batchId] });
      await qc.invalidateQueries({ queryKey: ['batchSalesSummary', batchId] });
    },
    onError: e => setError(e?.message || 'Failed to update dead crops'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => batchesApi.deleteBatch(batchId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['batches'] });
      navigate('/app/batches');
    },
    onError: e => setError(e?.message || 'Failed to delete batch'),
  });

  const isLoading = batchQ.isLoading || stockQ.isLoading || salesSummaryQ.isLoading;

  const batch = batchQ.data?.data?.batch;
  const stock = stockQ.data?.data?.stock;
  const summary = salesSummaryQ.data?.data?.summary;

  const sales = summary?.sales || [];
  const salesColumns = useMemo(
    () => [
      { key: 'saleDate', header: 'Date', render: r => fmtDate(r.saleDate) },
      { key: 'customer', header: 'Customer', render: r => r.customer?.name || '—' },
      { key: 'cropQuantity', header: 'Qty', render: r => fmtNumber(r.cropQuantity) },
      { key: 'pricePerCrop', header: 'Price', render: r => fmtMoney(r.pricePerCrop) },
      { key: 'totalAmount', header: 'Total', render: r => fmtMoney(r.totalAmount) },
      {
        key: 'open',
        header: '',
        className: 'text-right',
        tdClassName: 'text-right',
        render: r => (
          <Link className="text-sm font-semibold text-slate-900 hover:underline" to={`/app/sales/${r.id}`}>
            View
          </Link>
        ),
      },
    ],
    []
  );

  // Seed forms once (best effort).
  if (batch && !updateForm.getValues().batchName) {
    updateForm.reset({
      batchName: batch.batchName || '',
      cropType: batch.cropType || '',
      totalProduced: String(batch.totalProduced ?? ''),
      notes: batch.notes || '',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>🌱 Batch</div>
          <div className="text-xl font-extrabold" style={{ color: 'var(--brand-primary)' }}>{batch?.batchName}</div>
          <div className="mt-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{batch?.cropType}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await confirm({
                title: 'Delete batch?',
                message: 'This will permanently delete the batch. Deletion will fail if it has sales.',
                confirmText: 'Delete',
                variant: 'danger',
              });
              if (ok) deleteMutation.mutate();
            }}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </div>

      {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}
      {isLoading ? <Loader label="Loading batch…" /> : null}
      {batchQ.error ? (
        <Alert variant="danger" title="Failed to load batch">
          {batchQ.error.message}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Stock" description="Live inventory snapshot for this batch.">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Produced</div>
            <div className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{fmtNumber(stock?.totalProduced)}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Sold</div>
            <div className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{fmtNumber(stock?.soldCrops)}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Dead</div>
            <div className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{fmtNumber(stock?.deadCrops)}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Remaining</div>
            <div className="font-bold text-right" style={{ color: 'var(--brand-primary)' }}>{fmtNumber(stock?.remainingCrops)}</div>
          </div>
        </Card>

        <Card title="Sales summary" description="Revenue and sales activity for this batch.">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Sales</div>
            <div className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{fmtNumber(summary?.salesSummary?.totalSales)}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Qty sold</div>
            <div className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{fmtNumber(summary?.salesSummary?.totalQuantitySold)}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Revenue</div>
            <div className="font-bold text-right" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(summary?.salesSummary?.totalRevenue)}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Remaining</div>
            <div className="font-bold text-right" style={{ color: 'var(--text-primary)' }}>{fmtNumber(summary?.salesSummary?.remainingStock)}</div>
          </div>
        </Card>

        <Card title="Update dead crops" description="Adjust losses to keep stock accurate.">
          <form
            className="flex flex-col gap-3"
            onSubmit={deadForm.handleSubmit(v => deadMutation.mutate({ deadCrops: v.deadCrops }))}
          >
            <Input label="Dead crops" type="number" min="0" {...deadForm.register('deadCrops', { required: 'Required' })} />
            <Button isLoading={deadMutation.isPending} type="submit">
              Update
            </Button>
          </form>
        </Card>
      </div>

      <Card title="Edit batch" description="Update batch details and notes.">
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={updateForm.handleSubmit(v =>
            updateMutation.mutate({
              batchName: v.batchName,
              cropType: v.cropType,
              totalProduced: Number(v.totalProduced),
              notes: v.notes || undefined,
            })
          )}
        >
          <Input label="Batch name" {...updateForm.register('batchName', { required: 'Required' })} />
          <Input label="Crop type" {...updateForm.register('cropType', { required: 'Required' })} />
          <Input label="Total produced" type="number" min="1" {...updateForm.register('totalProduced', { required: 'Required' })} />
          <Input label="Notes" {...updateForm.register('notes')} />
          <div className="md:col-span-2">
            <Button isLoading={updateMutation.isPending} type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Sales in this batch" description="From batch sales summary payload">
        <Table columns={salesColumns} rows={sales} rowKey="id" emptyText="No sales for this batch yet." />
      </Card>
      {ConfirmDialog}
    </div>
  );
}

