export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className = '',
  children,
  ...props
}) {
  const base =
    'inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97]';
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-11 px-6 text-base',
  };
  const variants = {
    primary:
      'bg-[#2d6a4f] text-white hover:bg-[#1b4332] focus:ring-[#2d6a4f]/30 ring-offset-white shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary:
      'bg-white text-[#2d6a4f] border border-[#b7e4c7] hover:bg-[#f0f9f4] hover:border-[#52b788] focus:ring-[#2d6a4f]/10 ring-offset-white shadow-sm',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600/30 ring-offset-white shadow-sm hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-[#3a6351] hover:bg-[#f0f9f4] focus:ring-[#2d6a4f]/10 ring-offset-white',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>Loading…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
