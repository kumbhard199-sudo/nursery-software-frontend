export function Table({ columns, rows, rowKey, emptyText = 'No data', onRowClick }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: 'var(--surface-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr
              style={{
                background: 'linear-gradient(to right, #f0f9f4, #f8fffe)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${col.className || ''}`}
                  style={{ color: 'var(--brand-primary)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                  colSpan={columns.length}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🌱</span>
                    <span>{emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map(row => {
                const key = typeof rowKey === 'function' ? rowKey(row) : row?.[rowKey];
                return (
                  <tr
                    key={key}
                    className={`border-b transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                    style={{
                      borderColor: 'var(--border-subtle)',
                    }}
                    onMouseEnter={onRowClick ? e => { e.currentTarget.style.background = '#f0f9f4'; } : undefined}
                    onMouseLeave={onRowClick ? e => { e.currentTarget.style.background = 'transparent'; } : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm ${col.tdClassName || ''}`}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {col.render ? col.render(row) : row?.[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
