import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { fmtDate, fmtMoney } from '../../utils/format';
import * as customersApi from '../../services/customers';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function CustomerDetailPage() {
  const { id } = useParams();
  const customerId = Number(id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const customerQ = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getCustomer(customerId),
    enabled: Number.isFinite(customerId),
  });

  const updateForm = useForm({ defaultValues: { name: '', mobileNumber: '', address: '' } });

  useEffect(() => {
    const c = customerQ.data?.data?.customer;
    if (!c) return;
    updateForm.reset({
      name: c.name || '',
      mobileNumber: c.mobileNumber || '',
      address: c.address || '',
    });
  }, [customerQ.data, updateForm]);

  const updateMutation = useMutation({
    mutationFn: payload => customersApi.updateCustomer(customerId, payload),
    onSuccess: async () => {
      setError('');
      await qc.invalidateQueries({ queryKey: ['customers'] });
      await qc.invalidateQueries({ queryKey: ['customer', customerId] });
    },
    onError: e => setError(e?.message || 'Failed to update customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.deleteCustomer(customerId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['customers'] });
      navigate('/app/customers');
    },
    onError: e => setError(e?.message || 'Failed to delete customer'),
  });

  const customer = customerQ.data?.data?.customer;
  const sales = customer?.sales || [];

  const salesColumns = useMemo(
    () => [
      { key: 'saleDate', header: 'Date', render: r => fmtDate(r.saleDate) },
      { key: 'batch', header: 'Batch', render: r => r.batch?.batchName || '—' },
      { key: 'amount', header: 'Total', render: r => fmtMoney(r.totalAmount) },
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Customer</div>
          <div className="text-xl font-semibold text-slate-900">{customer?.name}</div>
          <div className="mt-1 text-sm text-slate-600">{customer?.mobileNumber}</div>
        </div>
        <Button
          variant="danger"
          isLoading={deleteMutation.isPending}
          onClick={async () => {
            const ok = await confirm({
              title: 'Delete customer?',
              message: 'This will permanently delete the customer. Deletion will fail if the customer has sales.',
              confirmText: 'Delete',
              variant: 'danger',
            });
            if (ok) deleteMutation.mutate();
          }}
        >
          Delete
        </Button>
      </div>

      {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}
      {customerQ.isLoading ? <Loader label="Loading customer…" /> : null}
      {customerQ.error ? (
        <Alert variant="danger" title="Failed to load customer">
          {customerQ.error.message}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Lifetime" description="Calculated by backend in customer details">
          <div className="text-3xl font-semibold text-slate-900">{fmtMoney(customer?.totalPurchases || 0)}</div>
          <div className="mt-1 text-xs text-slate-500">{customer?.totalTransactions || 0} transactions</div>
        </Card>

        <Card title="Address" description="Optional">
          <div className="text-sm text-slate-700">{customer?.address || '—'}</div>
        </Card>

        <Card title="Quick actions" description="Common operations">
          <Link className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-100" to="/app/sales">
            Record a new sale
          </Link>
        </Card>
      </div>

      <Card title="Edit customer" description="Update contact details and address.">
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={updateForm.handleSubmit(v => updateMutation.mutate(v))}
        >
          <Input label="Name" {...updateForm.register('name', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} />
          <Input label="Mobile number" {...updateForm.register('mobileNumber', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })} />
          <div className="md:col-span-2">
            <Input label="Address" {...updateForm.register('address')} />
          </div>
          <div className="md:col-span-2">
            <Button isLoading={updateMutation.isPending} type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Sales history" description="From `GET /api/customers/:id`">
        <Table columns={salesColumns} rows={sales} rowKey="id" emptyText="No sales for this customer yet." />
      </Card>
      {ConfirmDialog}
    </div>
  );
}

