import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Loader } from '../../components/ui/Loader';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { fmtDate, fmtMoney, fmtNumber, toISODateInput } from '../../utils/format';
import * as workersApi from '../../services/workers';
import { useConfirmDialog } from '../../hooks/useConfirmDialog.jsx';

export function WorkerDetailPage() {
  const { id } = useParams();
  const workerId = Number(id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const workerQ = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => workersApi.getWorker(workerId),
    enabled: Number.isFinite(workerId),
  });

  const updateForm = useForm({ defaultValues: { name: '', mobile: '' } });
  useEffect(() => {
    const w = workerQ.data?.data?.worker;
    if (!w) return;
    updateForm.reset({ name: w.name || '', mobile: w.mobile || '' });
  }, [workerQ.data, updateForm]);

  const attendanceForm = useForm({
    defaultValues: { date: toISODateInput(new Date()), workType: 'FULL_DAY', extraHours: '0', borrowedAmount: '0' },
  });

  const salaryForm = useForm({
    defaultValues: { month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()) },
  });
  const [salaryParams, setSalaryParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const salaryQ = useQuery({
    queryKey: ['salary', workerId, salaryParams.month, salaryParams.year],
    queryFn: () => workersApi.getSalary(workerId, salaryParams.month, salaryParams.year),
    enabled: Number.isFinite(workerId),
  });

  const updateMutation = useMutation({
    mutationFn: payload => workersApi.updateWorker(workerId, payload),
    onSuccess: async () => {
      setError('');
      setNotice('Worker updated.');
      await qc.invalidateQueries({ queryKey: ['worker', workerId] });
      await qc.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: e => setError(e?.message || 'Failed to update worker'),
  });

  const recordAttendanceMutation = useMutation({
    mutationFn: payload => workersApi.recordAttendance(workerId, payload),
    onSuccess: async () => {
      setError('');
      setNotice('Attendance recorded.');
      await qc.invalidateQueries({ queryKey: ['worker', workerId] });
      await qc.invalidateQueries({ queryKey: ['workers'] });
      await qc.invalidateQueries({ queryKey: ['salary', workerId, salaryParams.month, salaryParams.year] });
    },
    onError: e => setError(e?.message || 'Failed to record attendance'),
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ attendanceId, payload }) => workersApi.updateAttendance(attendanceId, payload),
    onSuccess: async () => {
      setError('');
      setNotice('Attendance updated.');
      await qc.invalidateQueries({ queryKey: ['worker', workerId] });
      await qc.invalidateQueries({ queryKey: ['salary', workerId, salaryParams.month, salaryParams.year] });
    },
    onError: e => setError(e?.message || 'Failed to update attendance'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => workersApi.deleteWorker(workerId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['workers'] });
      navigate('/app/workers');
    },
    onError: e => setError(e?.message || 'Failed to delete worker'),
  });

  const worker = workerQ.data?.data?.worker;
  const attendance = worker?.attendance || [];
  const salary = salaryQ.data?.data?.salary;

  const attendanceColumns = useMemo(
    () => [
      { key: 'date', header: 'Date', render: r => fmtDate(r.date) },
      { key: 'workType', header: 'Type', render: r => r.workType },
      { key: 'extraHours', header: 'Extra hrs', render: r => fmtNumber(r.extraHours) },
      { key: 'borrowedAmount', header: 'Borrowed', render: r => fmtMoney(r.borrowedAmount) },
      {
        key: 'edit',
        header: '',
        className: 'text-right',
        tdClassName: 'text-right',
        render: r => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const nextExtra = prompt('Extra hours', String(r.extraHours ?? 0));
              if (nextExtra === null) return;
              const nextBorrow = prompt('Borrowed amount', String(r.borrowedAmount ?? 0));
              if (nextBorrow === null) return;
              updateAttendanceMutation.mutate({
                attendanceId: r.id,
                payload: { extraHours: Number(nextExtra), borrowedAmount: Number(nextBorrow) },
              });
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    [updateAttendanceMutation]
  );

  return (
    <div className="space-y-6">
      {workerQ.isLoading ? <Loader label="Loading worker…" /> : null}
      {workerQ.error ? (
        <Alert variant="danger" title="Failed to load worker">
          {workerQ.error.message}
        </Alert>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500">Worker</div>
          <div className="text-xl font-semibold text-slate-900">{worker?.name}</div>
          <div className="mt-1 text-sm text-slate-600">{worker?.mobile}</div>
        </div>
        <Button
          variant="danger"
          isLoading={deleteMutation.isPending}
          onClick={async () => {
            const ok = await confirm({
              title: 'Delete worker?',
              message: 'This will permanently delete the worker. Deletion will fail if attendance records exist.',
              confirmText: 'Delete',
              variant: 'danger',
            });
            if (ok) deleteMutation.mutate();
          }}
        >
          Delete
        </Button>
      </div>

      {notice ? <Alert variant="success" title="Done">{notice}</Alert> : null}
      {error ? <Alert variant="danger" title="Error">{error}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card title="Edit worker" description="Update worker details.">
          <form className="flex flex-col gap-3" onSubmit={updateForm.handleSubmit(v => updateMutation.mutate(v))}>
            <Input label="Name" {...updateForm.register('name', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })} />
            <Input label="Mobile" {...updateForm.register('mobile', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })} />
            <Button isLoading={updateMutation.isPending} type="submit">
              Save
            </Button>
          </form>
        </Card>

        <Card title="Record attendance" description="Log a work day and any advances.">
          <form
            className="flex flex-col gap-3"
            onSubmit={attendanceForm.handleSubmit(v =>
              recordAttendanceMutation.mutate({
                date: v.date,
                workType: v.workType,
                extraHours: Number(v.extraHours || 0),
                borrowedAmount: Number(v.borrowedAmount || 0),
              })
            )}
          >
            <Input label="Date" type="date" {...attendanceForm.register('date', { required: 'Required' })} />
            <label className="block">
              <div className="mb-1 text-sm font-medium text-slate-700">Work type</div>
              <select
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-4 focus:ring-slate-900/10"
                {...attendanceForm.register('workType', { required: true })}
              >
                <option value="FULL_DAY">FULL_DAY</option>
                <option value="HALF_DAY">HALF_DAY</option>
              </select>
            </label>
            <Input label="Extra hours" type="number" min="0" {...attendanceForm.register('extraHours')} />
            <Input label="Borrowed amount" type="number" min="0" step="0.01" {...attendanceForm.register('borrowedAmount')} />
            <Button isLoading={recordAttendanceMutation.isPending} type="submit">
              Record
            </Button>
          </form>
        </Card>

        <Card title="Salary" description="Monthly salary breakdown from attendance.">
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={salaryForm.handleSubmit(v => setSalaryParams({ month: Number(v.month), year: Number(v.year) }))}
          >
            <Input label="Month" type="number" min="1" max="12" {...salaryForm.register('month', { required: true })} />
            <Input label="Year" type="number" min="2000" {...salaryForm.register('year', { required: true })} />
            <div className="col-span-2">
              <Button variant="secondary" isLoading={salaryQ.isFetching} type="submit">
                Calculate
              </Button>
            </div>
          </form>

          {salaryQ.isLoading ? <Loader label="Loading…" /> : null}
          {salaryQ.error ? <Alert variant="danger" title="Error">{salaryQ.error.message}</Alert> : null}
          {salary ? (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-1">Attendance</div>
              <div className="text-slate-500">Full Days</div>
              <div className="text-right font-semibold text-slate-900">{salary.fullDays}</div>
              <div className="text-slate-500">Half Days</div>
              <div className="text-right font-semibold text-slate-900">{salary.halfDays}</div>
              <div className="text-slate-500">Extra Hours</div>
              <div className="text-right font-semibold text-slate-900">{salary.totalExtraHours} hrs</div>
              <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100 pb-1 mt-1">Salary</div>
              <div className="text-slate-500">Full Day Pay</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(salary.breakdown?.fullDayAmount ?? 0)}</div>
              <div className="text-slate-500">Half Day Pay</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(salary.breakdown?.halfDayAmount ?? 0)}</div>
              <div className="text-slate-500">Extra Hour Pay</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(salary.breakdown?.extraHourAmount ?? 0)}</div>
              <div className="text-slate-500">Gross</div>
              <div className="text-right font-semibold text-slate-900">{fmtMoney(salary.grossSalary)}</div>
              <div className="text-slate-500">Borrowed</div>
              <div className="text-right font-semibold text-red-600">{fmtMoney(salary.totalBorrowed)}</div>
              <div className="text-slate-700 font-semibold">Net Salary</div>
              <div className="text-right font-bold text-emerald-700 text-base">{fmtMoney(salary.netSalary)}</div>
            </div>
          ) : null}
        </Card>
      </div>

      <Card title="Attendance records" description="Complete attendance history — all records shown. Use Edit to update extra hours or borrowed amount.">
        <Table columns={attendanceColumns} rows={attendance} rowKey="id" emptyText="No attendance yet." />
      </Card>
      {ConfirmDialog}
    </div>
  );
}

