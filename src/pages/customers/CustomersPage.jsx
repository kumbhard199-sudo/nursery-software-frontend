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
import { fmtMoney, fmtNumber } from '../../utils/format';
import * as customersApi from '../../services/customers';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function CustomersPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [serverQuery, setServerQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const listQ = useQuery({ queryKey: ['customers'], queryFn: customersApi.listCustomers });
  const searchQ = useQuery({
    queryKey: ['customersSearch', serverQuery],
    queryFn: () => customersApi.searchCustomers(serverQuery),
    enabled: false,
  });

  const createForm = useForm({ defaultValues: { name: '', mobileNumber: '', address: '' } });
  const createMutation = useMutation({
    mutationFn: customersApi.createCustomer,
    onSuccess: async res => {
      setError('');
      setCreateOpen(false);
      createForm.reset();
      await qc.invalidateQueries({ queryKey: ['customers'] });
      const id = res?.data?.customer?.id;
      if (id) navigate(`/app/customers/${id}`);
    },
    onError: e => setError(e?.message || 'Failed to create customer'),
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.deleteCustomer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const rows = listQ.data?.data?.customers || [];
  const serverRows = searchQ.data?.data?.customers || null;
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => `${r.name} ${r.mobileNumber}`.toLowerCase().includes(s));
  }, [rows, q]);

  const columns = [
    { key: 'name', header: 'Customer' },
    { key: 'mobileNumber', header: 'Mobile' },
    { key: '_count', header: 'Sales', render: r => fmtNumber(r?._count?.sales || 0) },
    {
      key: 'lifetime',
      header: 'Lifetime',
      render: r => {
        const total = (r.sales || []).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        return fmtMoney(total);
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      tdClassName: 'text-right',
      render: r => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={e => (e.stopPropagation(), navigate(`/app/customers/${r.id}`))}>
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async e => {
              e.stopPropagation();
              const ok = await confirm({
                title: 'Delete customer?',
                message: 'This will permanently delete the customer. Deletion will fail if the customer has sales.',
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
      <Card title="Customer management" description="Manage customer profiles and history." actions={<Button onClick={() => setCreateOpen(true)}>Add customer</Button>}>
        {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}
        {listQ.isLoading ? <Loader label="Loading customers…" /> : null}
        {listQ.error ? (
          <Alert variant="danger" title="Failed to load customers">
            {listQ.error.message}
          </Alert>
        ) : null}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchFilter value={q} onChange={setQ} placeholder="Search customers…" className="w-full md:max-w-sm" />
          <div className="text-xs text-slate-500">{filtered.length} of {rows.length}</div>
        </div>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-sm">
            <Input
              label="Server search (uses `/api/customers/search?q=`)"
              value={serverQuery}
              onChange={e => setServerQuery(e.target.value)}
              placeholder="Type at least 2 characters…"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              isLoading={searchQ.isFetching}
              onClick={async () => {
                setError('');
                try {
                  if (!serverQuery || serverQuery.trim().length < 2) {
                    setError('Search query must be at least 2 characters');
                    return;
                  }
                  await searchQ.refetch();
                } catch (e) {
                  setError(e?.message || 'Search failed');
                }
              }}
            >
              Search
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setServerQuery('');
                qc.removeQueries({ queryKey: ['customersSearch'] });
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        {serverRows ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Server results ({serverRows.length})
            </div>
            <div className="mt-3">
              <Table
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'mobileNumber', header: 'Mobile' },
                  {
                    key: 'open',
                    header: '',
                    className: 'text-right',
                    tdClassName: 'text-right',
                    render: r => (
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/app/customers/${r.id}`)}>
                        Open
                      </Button>
                    ),
                  },
                ]}
                rows={serverRows}
                rowKey="id"
                emptyText="No matches."
              />
            </div>
          </div>
        ) : null}
        <div className="mt-4">
          <Table columns={columns} rows={filtered} rowKey="id" onRowClick={r => navigate(`/app/customers/${r.id}`)} />
        </div>
      </Card>

      <Modal
        open={createOpen}
        title="Add customer"
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
          <Input label="Mobile number" placeholder="10 digits" {...createForm.register('mobileNumber', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })} />
          <div className="md:col-span-2">
            <Input label="Address (optional)" {...createForm.register('address')} />
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
      {ConfirmDialog}
    </div>
  );
}

