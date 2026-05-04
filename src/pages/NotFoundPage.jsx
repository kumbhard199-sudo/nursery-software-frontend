import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div
      className="min-h-dvh leaf-bg flex items-center justify-center px-4 animate-fadeIn"
      style={{ background: 'var(--surface-bg)' }}
    >
      <div className="w-full max-w-[500px]">
        <div
          className="rounded-3xl border p-10 text-center shadow-lg animate-fadeInUp"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--border-color)',
            borderTop: '4px solid #52b788',
          }}
        >
          {/* Big leaf + 404 */}
          <div className="text-6xl mb-4 animate-leafSway inline-block">🌿</div>
          <div
            className="text-5xl font-extrabold mb-2"
            style={{
              background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
            }}
          >
            404
          </div>
          <div className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Page not found
          </div>
          <div className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Looks like this path wandered off the garden trail.
          </div>
          <div className="flex justify-center">
            <Link to="/app">
              <Button size="lg">🌱 Back to Dashboard</Button>
            </Link>
          </div>

          <div className="mt-6 h-1 w-12 rounded-full mx-auto" style={{ background: 'linear-gradient(90deg, #2d6a4f, #95d5b2)' }} />
        </div>
      </div>
    </div>
  );
}
