import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Loader } from '../../components/ui/Loader';
import { Table } from '../../components/ui/Table';
import { fmtDate, fmtMoney, fmtNumber, toISODateInput } from '../../utils/format';
import * as reportsApi from '../../services/reports';
import * as salesApi from '../../services/sales';
import * as batchesApi from '../../services/batches';
import * as customersApi from '../../services/customers';

export function ReportsPage() {
  const now = new Date();
  const [monthlyParams, setMonthlyParams] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [profitParams, setProfitParams] = useState({
    startDate: toISODateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: toISODateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  });
  const [salesReportParams, setSalesReportParams] = useState({
    startDate: profitParams.startDate,
    endDate: profitParams.endDate,
    batchId: '',
    customerId: '',
  });

  const monthlyQ = useQuery({
    queryKey: ['monthlyReport', monthlyParams.month, monthlyParams.year],
    queryFn: () => reportsApi.getMonthlyReport(monthlyParams.month, monthlyParams.year),
  });

  const profitQ = useQuery({
    queryKey: ['profitSummary', profitParams.startDate, profitParams.endDate],
    queryFn: () => reportsApi.getProfitSummary(profitParams),
    enabled: Boolean(profitParams.startDate && profitParams.endDate),
  });

  const salesReportQ = useQuery({
    queryKey: ['salesReport', salesReportParams],
    queryFn: () =>
      salesApi.getSalesReport({
        startDate: salesReportParams.startDate,
        endDate: salesReportParams.endDate,
        batchId: salesReportParams.batchId || undefined,
        customerId: salesReportParams.customerId || undefined,
      }),
    enabled: Boolean(salesReportParams.startDate && salesReportParams.endDate),
  });

  const batchesQ = useQuery({ queryKey: ['batches'], queryFn: batchesApi.listBatches });
  const customersQ = useQuery({ queryKey: ['customers'], queryFn: customersApi.listCustomers });

  const monthlyForm = useForm({ defaultValues: monthlyParams });
  const profitForm = useForm({ defaultValues: profitParams });
  const salesForm = useForm({ defaultValues: salesReportParams });

  const monthly = monthlyQ.data?.data?.report;
  const profit = profitQ.data?.data?.summary;
  const salesReport = salesReportQ.data?.data?.report;

  const salesColumns = useMemo(
    () => [
      { key: 'saleDate', header: 'Date', render: r => fmtDate(r.saleDate) },
      { key: 'batch', header: 'Batch', render: r => r.batch?.batchName || '—' },
      { key: 'customer', header: 'Customer', render: r => r.customer?.name || '—' },
      { key: 'cropQuantity', header: 'Qty', render: r => fmtNumber(r.cropQuantity) },
      { key: 'totalAmount', header: 'Total', render: r => fmtMoney(r.totalAmount) },
    ],
    []
  );

  const monthlySales = monthly?.sales || [];

  const batches = batchesQ.data?.data?.batches || [];
  const customers = customersQ.data?.data?.customers || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Monthly report" description="Income, expenses, and profitability for a month.">
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={monthlyForm.handleSubmit(v => setMonthlyParams({ month: Number(v.month), year: Number(v.year) }))}
          >
            <Input label="Month" type="number" min="1" max="12" {...monthlyForm.register('month', { required: true })} />
            <Input label="Year" type="number" min="2000" {...monthlyForm.register('year', { required: true })} />
            <div className="col-span-2">
              <Button isLoading={monthlyQ.isFetching} type="submit">
                Load monthly report
              </Button>
            </div>
          </form>

          {monthlyQ.isLoading ? <Loader label="Loading…" /> : null}
          {monthlyQ.error ? <Alert variant="danger" title="Error">{monthlyQ.error.message}</Alert> : null}
          {monthly ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="text-slate-500">Income</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(monthly.income?.totalIncome)}</div>
              <div className="text-slate-500">Expenses</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(monthly.expenses?.totalExpenses)}</div>
              <div className="text-slate-500">Net profit</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(monthly.profit?.netProfit)}</div>
              <div className="text-slate-500">Profit margin</div>
              <div className="text-right font-semibold text-slate-900">{monthly.profit?.profitMargin}%</div>
            </div>
          ) : null}
        </Card>

        <Card title="Profit summary" description="Profit overview across a date range.">
          <form
            className="grid grid-cols-1 gap-3"
            onSubmit={profitForm.handleSubmit(v => setProfitParams({ startDate: v.startDate, endDate: v.endDate }))}
          >
            <Input label="Start date" type="date" {...profitForm.register('startDate', { required: true })} />
            <Input label="End date" type="date" {...profitForm.register('endDate', { required: true })} />
            <Button isLoading={profitQ.isFetching} type="submit">
              Load profit summary
            </Button>
          </form>

          {profitQ.isLoading ? <Loader label="Loading…" /> : null}
          {profitQ.error ? <Alert variant="danger" title="Error">{profitQ.error.message}</Alert> : null}
          {profit ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="text-slate-500">Income</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(profit.totalIncome)}</div>
              <div className="text-slate-500">Expenses</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(profit.totalExpenses)}</div>
              <div className="text-slate-500">Profit</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(profit.profit)}</div>
              <div className="text-slate-500">Margin</div>
              <div className="text-right font-semibold text-slate-900">{profit.profitMargin}%</div>
            </div>
          ) : null}
        </Card>

        <Card title="Sales report" description="Filter sales by date, batch, or customer.">
          <form
            className="grid grid-cols-1 gap-3"
            onSubmit={salesForm.handleSubmit(v =>
              setSalesReportParams({
                startDate: v.startDate,
                endDate: v.endDate,
                batchId: v.batchId,
                customerId: v.customerId,
              })
            )}
          >
            <Input label="Start date" type="date" {...salesForm.register('startDate', { required: true })} />
            <Input label="End date" type="date" {...salesForm.register('endDate', { required: true })} />
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Batch (optional)</div>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-slate-900/10"
                {...salesForm.register('batchId')}
              >
                <option value="">All batches</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.batchName} • {b.cropType}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Customer (optional)</div>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-slate-900/10"
                {...salesForm.register('customerId')}
              >
                <option value="">All customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} • {c.mobileNumber}
                  </option>
                ))}
              </select>
            </label>
            <Button isLoading={salesReportQ.isFetching} type="submit">
              Load sales report
            </Button>
          </form>

          {salesReportQ.isLoading ? <Loader label="Loading…" /> : null}
          {salesReportQ.error ? <Alert variant="danger" title="Error">{salesReportQ.error.message}</Alert> : null}
          {salesReport?.summary ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="text-slate-500">Sales</div>
              <div className="text-right font-semibold text-slate-900">{fmtNumber(salesReport.summary.totalSales)}</div>
              <div className="text-slate-500">Quantity</div>
              <div className="text-right font-semibold text-slate-900">{fmtNumber(salesReport.summary.totalQuantity)}</div>
              <div className="text-slate-500">Revenue</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(salesReport.summary.totalRevenue)}</div>
              <div className="text-slate-500">Net revenue</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(salesReport.summary.netRevenue)}</div>
            </div>
          ) : null}
        </Card>
      </div>

      <Card title="Monthly sales (detail)" description="From monthly report payload">
        {monthlyQ.isFetching && !monthlyQ.isLoading ? (
          <div className="mb-3 text-xs text-slate-500">Refreshing…</div>
        ) : null}
        <Table columns={salesColumns} rows={monthlySales} rowKey="id" emptyText="No sales in this period." />
      </Card>
    </div>
  );
}

