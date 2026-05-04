import { useEffect } from 'react';

export function Modal({ open, title, children, footer, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center animate-fadeIn">
      <button
        aria-label="Close modal"
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-xl animate-fadeInUp"
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-color)',
          borderTop: '4px solid #52b788',
        }}
      >
        <div
          className="flex items-start justify-between gap-3 border-b px-5 py-4"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'linear-gradient(to right, #f0f9f4, #f8fffe)',
          }}
        >
          <div className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
            {title}
          </div>
          <button
            className="cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold transition hover:bg-[#f0f9f4]"
            style={{ color: 'var(--text-muted)' }}
            onClick={onClose}
          >
            Esc ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div
            className="border-t px-5 py-4"
            style={{ borderColor: 'var(--border-subtle)', background: '#fafffe' }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
