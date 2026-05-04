export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1.5 text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>
          {label}
        </div>
      ) : null}
      <input
        className={`h-11 w-full rounded-xl border bg-white px-4 text-sm shadow-sm outline-none transition-all duration-200 placeholder:text-[#95d5b2] ${
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-600/10'
            : 'border-[#b7e4c7] focus:border-[#52b788] focus:ring-4 focus:ring-[#2d6a4f]/10'
        } ${className}`}
        style={{ color: 'var(--text-primary)' }}
        {...props}
      />
      {error ? <div className="mt-1.5 text-xs text-rose-600 font-medium">{error}</div> : null}
      {!error && hint ? (
        <div className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </div>
      ) : null}
    </label>
  );
}
