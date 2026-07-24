'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ background: 'hsl(222 47% 5%)', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '1rem' }}>
          <div style={{ maxWidth: '28rem' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg style={{ width: '2rem', height: '2rem', color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Something went wrong</h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              {error.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={reset}
              style={{ padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: '600', background: 'rgba(0,212,170,0.2)', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
