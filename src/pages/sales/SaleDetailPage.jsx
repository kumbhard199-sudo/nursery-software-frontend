import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { fmtDate, fmtMoney, fmtNumber } from '../../utils/format';
import * as salesApi from '../../services/sales';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function SaleDetailPage() {
  const { id } = useParams();
  const saleId = Number(id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const saleQ = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => salesApi.getSale(saleId),
    enabled: Number.isFinite(saleId),
  });

  const invoiceMutation = useMutation({
    mutationFn: () => salesApi.generateInvoice(saleId),
    onSuccess: res => {
      setError('');
      const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
      const downloadUrl = res?.data?.downloadUrl;
      const invoicePath = res?.data?.invoicePath;

      // Backend may return a Windows absolute path; always derive a safe public URL.
      const raw = downloadUrl || invoicePath || '';
      const fileName = raw ? String(raw).split(/[/\\]/).pop() : '';
      const publicUrl = fileName ? `${base}/uploads/invoices/${encodeURIComponent(fileName)}` : '';

      if (publicUrl) {
        window.open(publicUrl, '_blank', 'noopener,noreferrer');
        setNotice('Invoice generated. Download opened in a new tab.');
      } else {
        setNotice('Invoice generated.');
      }
    },
    onError: e => setError(e?.message || 'Failed to generate invoice'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => salesApi.deleteSale(saleId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['sales'] });
      await qc.invalidateQueries({ queryKey: ['batches'] });
      navigate('/app/sales');
    },
    onError: e => setError(e?.message || 'Failed to delete sale'),
  });

  const sale = saleQ.data?.data?.sale;
  const customer = sale?.customer;
  const batch = sale?.batch;

  const breakdown = useMemo(() => {
    const qty = Number(sale?.cropQuantity || 0);
    const price = Number(sale?.pricePerCrop || 0);
    const travel = Number(sale?.travelingCost || 0);
    const plant = Number(sale?.plantationCost || 0);
    return {
      items: qty * price,
      travel,
      plant,
      total: Number(sale?.totalAmount || qty * price + travel + plant),
    };
  }, [sale]);

  return (
    <div className="space-y-6">
      {saleQ.isLoading ? <Loader label="Loading sale…" /> : null}
      {saleQ.error ? (
        <Alert variant="danger" title="Failed to load sale">
          {saleQ.error.message}
        </Alert>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Sale</div>
          <div className="text-xl font-semibold text-slate-900">#{sale?.id}</div>
          <div className="mt-1 text-sm text-slate-600">Date: {fmtDate(sale?.saleDate)}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button isLoading={invoiceMutation.isPending} onClick={() => invoiceMutation.mutate()}>
            Generate invoice
          </Button>
          <Button
            variant="danger"
            isLoading={deleteMutation.isPending}
            onClick={async () => {
              const ok = await confirm({
                title: 'Delete sale?',
                message: 'This will permanently delete the sale record.',
                confirmText: 'Delete',
                variant: 'danger',
              });
              if (ok) deleteMutation.mutate();
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {notice ? <Alert variant="success" title="Done">{notice}</Alert> : null}
      {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Customer" description="From `GET /api/sales/:id`">
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">{customer?.name || '—'}</div>
            <div className="mt-1 text-slate-600">{customer?.mobileNumber || '—'}</div>
            <div className="mt-3">
              <Link className="text-sm font-semibold text-slate-900 hover:underline" to={`/app/customers/${customer?.id}`}>
                Open customer profile
              </Link>
            </div>
          </div>
        </Card>

        <Card title="Batch" description="From `GET /api/sales/:id`">
          <div className="text-sm text-slate-700">
            <div className="font-semibold text-slate-900">{batch?.batchName || '—'}</div>
            <div className="mt-1 text-slate-600">{batch?.cropType || '—'}</div>
            <div className="mt-3">
              <Link className="text-sm font-semibold text-slate-900 hover:underline" to={`/app/batches/${batch?.id}`}>
                Open batch
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Sale details" description="Quantity, costs, totals">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-slate-500">Quantity</div>
          <div className="text-right font-semibold text-slate-900">{fmtNumber(sale?.cropQuantity)}</div>
          <div className="text-slate-500">Price per crop</div>
          <div className="text-right font-semibold text-slate-900">{fmtMoney(sale?.pricePerCrop)}</div>
          <div className="text-slate-500">Items</div>
          <div className="text-right font-semibold text-slate-900">{fmtMoney(breakdown.items)}</div>
          <div className="text-slate-500">Traveling cost</div>
          <div className="text-right font-semibold text-slate-900">{fmtMoney(breakdown.travel)}</div>
          <div className="text-slate-500">Plantation cost</div>
          <div className="text-right font-semibold text-slate-900">{fmtMoney(breakdown.plant)}</div>
          <div className="text-slate-500">Total</div>
          <div className="text-right text-base font-semibold text-slate-900">{fmtMoney(breakdown.total)}</div>
        </div>
      </Card>
      {ConfirmDialog}
    </div>
  );
}

