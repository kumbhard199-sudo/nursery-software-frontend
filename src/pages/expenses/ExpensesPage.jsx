import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Loader } from '../../components/ui/Loader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { SearchFilter } from '../../components/ui/SearchFilter';
import { fmtDate, fmtMoney, fmtNumber, toISODateInput } from '../../utils/format';
import * as expensesApi from '../../services/expenses';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function ExpensesPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [monthlyParams, setMonthlyParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [summaryParams, setSummaryParams] = useState({
    startDate: toISODateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    endDate: toISODateInput(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)),
  });

  const listQ = useQuery({ queryKey: ['rawMaterials'], queryFn: expensesApi.listRawMaterials });
  const monthlyQ = useQuery({
    queryKey: ['monthlyExpenses', monthlyParams.month, monthlyParams.year],
    queryFn: () => expensesApi.getMonthlyExpenses(monthlyParams.month, monthlyParams.year),
  });
  const summaryQ = useQuery({
    queryKey: ['expenseSummary', summaryParams.startDate, summaryParams.endDate],
    queryFn: () => expensesApi.getExpenseSummary(summaryParams),
    enabled: Boolean(summaryParams.startDate && summaryParams.endDate),
  });

  const createForm = useForm({
    defaultValues: { materialName: '', quantity: '', cost: '', purchaseDate: toISODateInput(new Date()), notes: '' },
  });
  const editForm = useForm({
    defaultValues: { materialName: '', quantity: '', cost: '', purchaseDate: toISODateInput(new Date()), notes: '' },
  });
  const monthlyForm = useForm({ defaultValues: monthlyParams });
  const summaryForm = useForm({ defaultValues: summaryParams });

  const createMutation = useMutation({
    mutationFn: expensesApi.addRawMaterial,
    onSuccess: async () => {
      setError('');
      setCreateOpen(false);
      createForm.reset();
      await qc.invalidateQueries({ queryKey: ['rawMaterials'] });
      await qc.invalidateQueries({ queryKey: ['monthlyExpenses'] });
      await qc.invalidateQueries({ queryKey: ['expenseSummary'] });
    },
    onError: e => setError(e?.message || 'Failed to add raw material'),
  });

  const deleteMutation = useMutation({
    mutationFn: expensesApi.deleteRawMaterial,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['rawMaterials'] });
      await qc.invalidateQueries({ queryKey: ['monthlyExpenses'] });
      await qc.invalidateQueries({ queryKey: ['expenseSummary'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => expensesApi.updateRawMaterial(id, payload),
    onSuccess: async () => {
      setError('');
      setEditId(null);
      await qc.invalidateQueries({ queryKey: ['rawMaterials'] });
      await qc.invalidateQueries({ queryKey: ['monthlyExpenses'] });
      await qc.invalidateQueries({ queryKey: ['expenseSummary'] });
    },
    onError: e => setError(e?.message || 'Failed to update raw material'),
  });

  const rows = listQ.data?.data?.materials || [];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => `${r.materialName} ${r.notes || ''}`.toLowerCase().includes(s));
  }, [rows, q]);

  const columns = [
    { key: 'purchaseDate', header: 'Date', render: r => fmtDate(r.purchaseDate) },
    { key: 'materialName', header: 'Material' },
    { key: 'quantity', header: 'Qty', render: r => fmtNumber(r.quantity) },
    { key: 'cost', header: 'Cost', render: r => fmtMoney(r.cost) },
    { key: 'notes', header: 'Notes', render: r => r.notes || '—' },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      tdClassName: 'text-right',
      render: r => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              setError('');
              setEditId(r.id);
              try {
                const res = await expensesApi.getRawMaterial(r.id);
                const m = res?.data?.material;
                editForm.reset({
                  materialName: m?.materialName || '',
                  quantity: String(m?.quantity ?? ''),
                  cost: String(m?.cost ?? ''),
                  purchaseDate: toISODateInput(m?.purchaseDate),
                  notes: m?.notes || '',
                });
              } catch (e) {
                setError(e?.message || 'Failed to load raw material');
              }
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              const ok = await confirm({
                title: 'Delete entry?',
                message: 'This will permanently delete the raw material expense entry.',
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

  const monthly = monthlyQ.data?.data?.expenses;
  const summary = summaryQ.data?.data?.summary;

  return (
    <div className="space-y-6">
      <Card
        title="Raw materials"
        description="Track purchase costs and materials used in production."
        actions={<Button onClick={() => setCreateOpen(true)}>Add raw material</Button>}
      >
        {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}
        {listQ.isLoading ? <Loader label="Loading expenses…" /> : null}
        {listQ.error ? (
          <Alert variant="danger" title="Failed to load raw materials">
            {listQ.error.message}
          </Alert>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchFilter value={q} onChange={setQ} placeholder="Search raw materials…" className="w-full md:max-w-sm" />
          <div className="text-xs text-slate-500">{filtered.length} of {rows.length}</div>
        </div>
        <div className="mt-4">
          <Table columns={columns} rows={filtered} rowKey="id" emptyText="No raw materials yet." />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Monthly expenses" description="Summary for a selected month.">
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={monthlyForm.handleSubmit(v => setMonthlyParams({ month: Number(v.month), year: Number(v.year) }))}
          >
            <Input label="Month" type="number" min="1" max="12" {...monthlyForm.register('month', { required: true })} />
            <Input label="Year" type="number" min="2000" {...monthlyForm.register('year', { required: true })} />
            <div className="col-span-2">
              <Button variant="secondary" isLoading={monthlyQ.isFetching} type="submit">
                Load
              </Button>
            </div>
          </form>
          {monthlyQ.isLoading ? <Loader label="Loading…" /> : null}
          {monthlyQ.error ? <Alert variant="danger" title="Error">{monthlyQ.error.message}</Alert> : null}
          {monthly ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="text-slate-500">Total</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(monthly.totalExpense)}</div>
              <div className="text-slate-500">Entries</div>
              <div className="text-right font-semibold text-slate-900">{fmtNumber(monthly.count)}</div>
            </div>
          ) : null}
        </Card>

        <Card title="Expense summary" description="Totals and breakdown by material.">
          <form
            className="grid grid-cols-1 gap-3"
            onSubmit={summaryForm.handleSubmit(v => setSummaryParams({ startDate: v.startDate, endDate: v.endDate }))}
          >
            <Input label="Start date" type="date" {...summaryForm.register('startDate', { required: true })} />
            <Input label="End date" type="date" {...summaryForm.register('endDate', { required: true })} />
            <Button variant="secondary" isLoading={summaryQ.isFetching} type="submit">
              Load
            </Button>
          </form>
          {summaryQ.isLoading ? <Loader label="Loading…" /> : null}
          {summaryQ.error ? <Alert variant="danger" title="Error">{summaryQ.error.message}</Alert> : null}
          {summary ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-slate-500">Total</div>
                <div className="font-semibold text-slate-900">{fmtMoney(summary.totalExpense)}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">By material</div>
                <div className="mt-2 space-y-2">
                  {Object.entries(summary.byMaterial || {}).length === 0 ? (
                    <div className="text-xs text-slate-500">No breakdown</div>
                  ) : (
                    Object.entries(summary.byMaterial).map(([name, cost]) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="text-slate-700">{name}</div>
                        <div className="font-semibold text-slate-900">{fmtMoney(cost)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Modal
        open={createOpen}
        title="Add raw material"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={createMutation.isPending} onClick={createForm.handleSubmit(v => createMutation.mutate(v))}>
              Add
            </Button>
          </div>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={createForm.handleSubmit(v => createMutation.mutate(v))}>
          <Input label="Material name" {...createForm.register('materialName', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} />
          <Input label="Purchase date" type="date" {...createForm.register('purchaseDate')} />
          <Input label="Quantity" type="number" min="1" {...createForm.register('quantity', { required: 'Required' })} />
          <Input label="Cost" type="number" min="0" step="0.01" {...createForm.register('cost', { required: 'Required' })} />
          <div className="md:col-span-2">
            <Input label="Notes (optional)" {...createForm.register('notes')} />
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <Modal
        open={Boolean(editId)}
        title="Edit raw material"
        onClose={() => setEditId(null)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button
              isLoading={updateMutation.isPending}
              onClick={editForm.handleSubmit(v =>
                updateMutation.mutate({
                  id: editId,
                  payload: {
                    materialName: v.materialName,
                    quantity: Number(v.quantity),
                    cost: Number(v.cost),
                    purchaseDate: v.purchaseDate,
                    notes: v.notes || undefined,
                  },
                })
              )}
            >
              Save
            </Button>
          </div>
        }
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={editForm.handleSubmit(() => {})}>
          <Input label="Material name" {...editForm.register('materialName', { required: 'Required' })} />
          <Input label="Purchase date" type="date" {...editForm.register('purchaseDate')} />
          <Input label="Quantity" type="number" min="1" {...editForm.register('quantity', { required: 'Required' })} />
          <Input label="Cost" type="number" min="0" step="0.01" {...editForm.register('cost', { required: 'Required' })} />
          <div className="md:col-span-2">
            <Input label="Notes" {...editForm.register('notes')} />
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
      {ConfirmDialog}
    </div>
  );
}

