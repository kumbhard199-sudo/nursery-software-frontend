import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { fmtDate, fmtMoney } from '../../utils/format';
import * as travellingCostsApi from '../../services/travellingCosts';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

function toISODateInput(d) {
  return d.toISOString().split('T')[0];
}

export function TravellingCostsPage() {
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Filter state
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));

  // Summary year
  const [summaryYear, setSummaryYear] = useState(String(new Date().getFullYear()));

  const listQ = useQuery({
    queryKey: ['travelling-costs', filterMonth, filterYear],
    queryFn: () =>
      travellingCostsApi.listTravellingCosts({
        month: filterMonth || undefined,
        year: filterYear || undefined,
      }),
  });

  const summaryQ = useQuery({
    queryKey: ['travelling-costs-summary', summaryYear],
    queryFn: () => travellingCostsApi.getMonthlySummary(summaryYear),
    enabled: !!summaryYear,
  });

  const createForm = useForm({
    defaultValues: {
      customerName: '',
      location: '',
      cost: '',
      travelDate: toISODateInput(new Date()),
      notes: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: payload => travellingCostsApi.createTravellingCost(payload),
    onSuccess: async () => {
      setError('');
      setNotice('Travelling cost recorded successfully.');
      createForm.reset({
        customerName: '',
        location: '',
        cost: '',
        travelDate: toISODateInput(new Date()),
        notes: '',
      });
      await qc.invalidateQueries({ queryKey: ['travelling-costs'] });
      await qc.invalidateQueries({ queryKey: ['travelling-costs-summary'] });
    },
    onError: e => setError(e?.message || 'Failed to record travelling cost'),
  });

  const deleteMutation = useMutation({
    mutationFn: id => travellingCostsApi.deleteTravellingCost(id),
    onSuccess: async () => {
      setError('');
      setNotice('Record deleted.');
      await qc.invalidateQueries({ queryKey: ['travelling-costs'] });
      await qc.invalidateQueries({ queryKey: ['travelling-costs-summary'] });
    },
    onError: e => setError(e?.message || 'Failed to delete record'),
  });

  const entries = listQ.data?.data?.travellingCosts || [];
  const summary = summaryQ.data?.data?.summary;

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const columns = useMemo(
    () => [
      { key: 'date', header: 'Date', render: r => fmtDate(r.travelDate) },
      { key: 'customerName', header: 'Customer Name', render: r => r.customerName },
      { key: 'location', header: 'Location', render: r => r.location },
      { key: 'cost', header: 'Cost', render: r => fmtMoney(r.cost) },
      { key: 'notes', header: 'Notes', render: r => r.notes || '—' },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        tdClassName: 'text-right',
        render: r => (
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={async () => {
              const ok = await confirm({
                title: 'Delete record?',
                message: 'This will permanently delete this travelling cost entry.',
                confirmText: 'Delete',
                variant: 'danger',
              });
              if (ok) deleteMutation.mutate(r.id);
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    [deleteMutation, confirm]
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-slate-500">Module</div>
        <div className="text-xl font-semibold text-slate-900">Travelling Costs</div>
        <div className="mt-1 text-sm text-slate-600">
          Track and manage travelling expenses per customer and location.
        </div>
      </div>

      {notice ? <Alert variant="success" title="Done">{notice}</Alert> : null}
      {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Add entry form */}
        <Card title="Add Travelling Cost" description="Record a new travelling expense.">
          <form
            className="flex flex-col gap-3"
            onSubmit={createForm.handleSubmit(v =>
              createMutation.mutate({
                customerName: v.customerName,
                location: v.location,
                cost: parseFloat(v.cost),
                travelDate: v.travelDate,
                notes: v.notes || undefined,
              })
            )}
          >
            <Input
              label="Customer Name"
              {...createForm.register('customerName', {
                required: 'Required',
                minLength: { value: 2, message: 'Min 2 characters' },
              })}
              error={createForm.formState.errors.customerName?.message}
            />
            <Input
              label="Location"
              {...createForm.register('location', {
                required: 'Required',
                minLength: { value: 2, message: 'Min 2 characters' },
              })}
              error={createForm.formState.errors.location?.message}
            />
            <Input
              label="Travelling Cost (₹)"
              type="number"
              min="0"
              step="0.01"
              {...createForm.register('cost', {
                required: 'Required',
                min: { value: 0, message: 'Must be non-negative' },
              })}
              error={createForm.formState.errors.cost?.message}
            />
            <Input
              label="Travel Date"
              type="date"
              {...createForm.register('travelDate', { required: 'Required' })}
              error={createForm.formState.errors.travelDate?.message}
            />
            <Input
              label="Notes (optional)"
              {...createForm.register('notes')}
            />
            <Button isLoading={createMutation.isPending} type="submit">
              Add Record
            </Button>
          </form>
        </Card>

        {/* Monthly filter */}
        <Card title="Filter Records" description="Filter by month and year.">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Month</label>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-slate-900/10"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {MONTH_NAMES.map((m, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Year"
              type="number"
              min="2000"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setFilterMonth('');
                setFilterYear(String(new Date().getFullYear()));
              }}
            >
              Clear Filter
            </Button>
          </div>

          {listQ.isFetching ? null : (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total records</span>
                <span className="font-semibold text-slate-900">{entries.length}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-500">Total cost</span>
                <span className="font-semibold text-slate-900">
                  {fmtMoney(entries.reduce((s, e) => s + e.cost, 0))}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Monthly summary */}
        <Card title="Monthly Summary" description="Total travelling costs per month.">
          <div className="flex flex-col gap-3">
            <Input
              label="Year"
              type="number"
              min="2000"
              value={summaryYear}
              onChange={e => setSummaryYear(e.target.value)}
            />
          </div>
          {summaryQ.isLoading ? <Loader label="Loading summary…" /> : null}
          {summaryQ.error ? (
            <Alert variant="danger" title="Error">{summaryQ.error.message}</Alert>
          ) : null}
          {summary ? (
            <div className="mt-4 space-y-1 text-sm max-h-64 overflow-y-auto">
              {summary.monthly
                .filter(m => m.count > 0)
                .map(m => (
                  <div key={m.month} className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">{MONTH_NAMES[m.month - 1]}</span>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{fmtMoney(m.totalCost)}</div>
                      <div className="text-xs text-slate-400">{m.count} record{m.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              {summary.monthly.every(m => m.count === 0) && (
                <div className="text-slate-400 text-center py-4">No records for {summaryYear}</div>
              )}
              <div className="flex justify-between items-center pt-2 font-semibold text-slate-900">
                <span>Year Total</span>
                <span>{fmtMoney(summary.totalCost)}</span>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Records table */}
      <Card
        title="Travelling Cost Records"
        description={
          filterMonth
            ? `Showing ${MONTH_NAMES[parseInt(filterMonth) - 1]} ${filterYear}`
            : filterYear
            ? `Showing all records for ${filterYear}`
            : 'All records'
        }
      >
        {listQ.isLoading ? <Loader label="Loading records…" /> : null}
        {listQ.error ? (
          <Alert variant="danger" title="Failed to load records">
            {listQ.error.message}
          </Alert>
        ) : null}
        <Table
          columns={columns}
          rows={entries}
          rowKey="id"
          emptyText="No travelling cost records found."
        />
      </Card>

      {ConfirmDialog}
    </div>
  );
}
