export function Alert({ variant = 'info', title, children, className = '' }) {
  const variants = {
    info:    { cls: 'border-[#b7e4c7] bg-[#f0f9f4] text-[#1a3226]',       accent: '#52b788' },
    success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-900',   accent: '#059669' },
    warning: { cls: 'border-amber-200 bg-amber-50 text-amber-900',         accent: '#d97706' },
    danger:  { cls: 'border-rose-200 bg-rose-50 text-rose-900',            accent: '#e11d48' },
  };
  const v = variants[variant] || variants.info;

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm shadow-sm animate-fadeIn ${v.cls} ${className}`}
      style={{ borderLeft: `4px solid ${v.accent}` }}
    >
      {title ? <div className="mb-1 font-bold">{title}</div> : null}
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}
