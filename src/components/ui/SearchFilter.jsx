export function SearchFilter({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* Leaf / search icon */}
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
        style={{ color: 'var(--brand-primary-light)' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-[#95d5b2] focus:ring-4"
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          '--tw-ring-color': 'rgb(45 106 79 / 0.1)',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#52b788';
          e.currentTarget.style.boxShadow = '0 0 0 4px rgb(45 106 79 / 0.1)';
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
