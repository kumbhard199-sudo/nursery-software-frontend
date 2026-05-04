export function Card({ title, description, actions, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-color)',
        borderLeft: '4px solid #52b788',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {(title || description || actions) && (
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-4 rounded-tl-2xl rounded-tr-2xl"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'linear-gradient(to right, #f0f9f4, #f8fffe)',
          }}
        >
          <div>
            {title ? (
              <div className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                {title}
              </div>
            ) : null}
            {description ? (
              <div className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {description}
              </div>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
