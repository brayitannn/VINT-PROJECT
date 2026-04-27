import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ExplorarClient } from '@/components/explorar/ExplorarClient'

export const metadata = {
  title: 'Explorar — Vint',
  description: 'Descubre ropa de segunda mano con estilo. Filtra por categoría, talla, precio y condición.',
}

function ExplorarSkeleton() {
  return (
    <div style={{
      maxWidth: 1280, margin: '0 auto',
      padding: '32px 2rem',
      display: 'flex', gap: 28,
    }}>
      {/* Sidebar skeleton */}
      <div style={{
        width: 260, flexShrink: 0,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20, height: 500,
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      {/* Grid skeleton */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 20,
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            height: 300, borderRadius: 20,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

export default function ExplorarPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <style>{`
        .volver-link { color: var(--text-muted); }
        .volver-link:hover { color: var(--accent) !important; }
      `}</style>

      {/* Page header */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '24px 2rem 0',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: '999px',
              backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              marginBottom: 24, transition: 'all 0.2s',
            }}
            className="hover:scale-105 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <ArrowLeft size={18} /> Volver al Dashboard
          </Link>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(22px, 3vw, 32px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            Explorar
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            Encuentra tu próxima prenda favorita
          </p>
        </div>
      </div>

      {/* Client component with Suspense for useSearchParams */}
      <Suspense fallback={<ExplorarSkeleton />}>
        <ExplorarClient />
      </Suspense>
    </main>
  )
}
