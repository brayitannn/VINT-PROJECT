import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FavoritosClient } from '@/components/products/FavoritosClient'

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
        padding: '24px 2rem 0',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Link 
            href="/" 
            className="volver-link"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: 500, marginBottom: 16, transition: 'color 0.2s'
            }}
          >
            <ArrowLeft size={16} /> Volver
          </Link>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 32px)',
            fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4,
          }}>
            Mis Favoritos
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            Tus prendas guardadas en un solo lugar
          </p>
        </div>
      </div>

      <FavoritosClient />
    </main>
  )
}
