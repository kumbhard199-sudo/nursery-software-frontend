/* Spinner Loader */
export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-12 w-12">
        <span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: 'var(--border-color)' }}
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#52b788',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        {/* Inner dot */}
        <span
          className="absolute inset-0 flex items-center justify-center text-base"
        >
          🌿
        </span>
      </div>
      <span
        className="text-sm font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
    </div>
  );
}

/* Skeleton shimmer block */
export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}
