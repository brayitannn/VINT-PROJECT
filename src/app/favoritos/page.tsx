import { Suspense } from 'react'
import { FavoritosClient } from '@/components/favoritos/FavoritosClient'

export const metadata = {
  title: 'Mis Favoritos — Vint',
  description: 'Prendas guardadas para comprar más tarde.',
}

export default function FavoritosPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <style>{`
        .volver-link { color: var(--text-muted); }
        .volver-link:hover { color: var(--accent) !important; }
      `}</style>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '24px 2rem',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 32px)',
            fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4,
          }}>
            Mis Favoritos
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 0 }}>
            Tus prendas guardadas en un solo lugar
          </p>
        </div>
      </div>

      <FavoritosClient />
    </main>
  )
}
