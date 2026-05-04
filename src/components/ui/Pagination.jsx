import { Button } from './Button';

export function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        Page{' '}
        <span style={{ color: 'var(--brand-primary)' }}>{page}</span>
        {' '}of{' '}
        <span style={{ color: 'var(--brand-primary)' }}>{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={!canPrev} onClick={() => onChange(page - 1)}>
          ← Prev
        </Button>
        <Button variant="secondary" size="sm" disabled={!canNext} onClick={() => onChange(page + 1)}>
          Next →
        </Button>
      </div>
    </div>
  );
}
