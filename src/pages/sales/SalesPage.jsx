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
import { fmtDate, fmtMoney, fmtNumber, toISODateInput } from '../../utils/format';
import * as salesApi from '../../services/sales';
import * as batchesApi from '../../services/batches';
import * as customersApi from '../../services/customers';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function SalesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const salesQ = useQuery({ queryKey: ['sales'], queryFn: salesApi.listSales });
  const batchesQ = useQuery({ queryKey: ['batches'], queryFn: batchesApi.listBatches });
  const customersQ = useQuery({ queryKey: ['customers'], queryFn: customersApi.listCustomers });
  const isLoading = salesQ.isLoading || batchesQ.isLoading || customersQ.isLoading;

  const createForm = useForm({
    defaultValues: {
      batchId: '',
      customerId: '',
      cropQuantity: '',
      pricePerCrop: '',
      travelingCost: '0',
      plantationCost: '0',
    },
  });

  const createMutation = useMutation({
    mutationFn: salesApi.createSale,
    onSuccess: async res => {
      setError('');
      setCreateOpen(false);
      createForm.reset();
      await qc.invalidateQueries({ queryKey: ['sales'] });
      await qc.invalidateQueries({ queryKey: ['batches'] });
      const id = res?.data?.sale?.id;
      if (id) navigate(`/app/sales/${id}`);
    },
    onError: e => setError(e?.message || 'Failed to record sale'),
  });

  const deleteMutation = useMutation({
    mutationFn: salesApi.deleteSale,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['sales'] });
      await qc.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  const rows = salesQ.data?.data?.sales || [];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      `${r.batch?.batchName || ''} ${r.customer?.name || ''} ${r.customer?.mobileNumber || ''}`.toLowerCase().includes(s)
    );
  }, [rows, q]);

  const columns = [
    { key: 'saleDate', header: 'Date', render: r => fmtDate(r.saleDate) },
    { key: 'batch', header: 'Batch', render: r => r.batch?.batchName || '—' },
    { key: 'customer', header: 'Customer', render: r => r.customer?.name || '—' },
    { key: 'cropQuantity', header: 'Qty', render: r => fmtNumber(r.cropQuantity) },
    { key: 'totalAmount', header: 'Total', render: r => fmtMoney(r.totalAmount) },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      tdClassName: 'text-right',
      render: r => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={e => (e.stopPropagation(), navigate(`/app/sales/${r.id}`))}>
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async e => {
              e.stopPropagation();
              const ok = await confirm({
                title: 'Delete sale?',
                message: 'This will permanently delete the sale record.',
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

  const batches = batchesQ.data?.data?.batches || [];
  const customers = customersQ.data?.data?.customers || [];

  return (
    <div className="space-y-4">
      <Card
        title="Sales management"
        description="Record sales, manage invoices, and track revenue."
        actions={<Button onClick={() => setCreateOpen(true)}>Record sale</Button>}
      >
        {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}
        {isLoading ? <Loader label="Loading sales…" /> : null}
        {salesQ.error ? (
          <Alert variant="danger" title="Failed to load sales">
            {salesQ.error.message}
          </Alert>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchFilter value={q} onChange={setQ} placeholder="Search by batch/customer/mobile…" className="w-full md:max-w-sm" />
          <div className="text-xs text-slate-500">{filtered.length} of {rows.length}</div>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={filtered} rowKey="id" onRowClick={r => navigate(`/app/sales/${r.id}`)} />
        </div>
      </Card>

      <Modal
        open={createOpen}
        title="Record a sale"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={createMutation.isPending} onClick={createForm.handleSubmit(v => createMutation.mutate(v))}>
              Save sale
            </Button>
          </div>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createForm.handleSubmit(v => createMutation.mutate(v))}>
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">Batch</div>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-slate-900/10"
              {...createForm.register('batchId', { required: true })}
            >
              <option value="">Select batch…</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batchName} • {b.cropType} (Remaining: {b.remainingCrops})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">Customer</div>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-slate-900/10"
              {...createForm.register('customerId', { required: true })}
            >
              <option value="">Select customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} • {c.mobileNumber}
                </option>
              ))}
            </select>
          </label>

          <Input label="Quantity" type="number" min="1" {...createForm.register('cropQuantity', { required: true })} />
          <Input label="Price per crop" type="number" step="0.01" min="0" {...createForm.register('pricePerCrop', { required: true })} />
          <Input label="Traveling cost" type="number" step="0.01" min="0" {...createForm.register('travelingCost')} />
          <Input label="Plantation cost" type="number" step="0.01" min="0" {...createForm.register('plantationCost')} />
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Sale date is set by backend (server time). Today: <span className="font-semibold text-slate-900">{toISODateInput()}</span>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
      {ConfirmDialog}
    </div>
  );
}

