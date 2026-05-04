export function fmtMoney(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(n);
}

export function fmtNumber(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat().format(n);
}

export function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d);
}

export function toISODateInput(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

