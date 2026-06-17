'use client'

import { Search, Heart, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { type MockUser } from '@/lib/supabase/mock-user'
import { useAuth } from '@/context/AuthContext'
import { useRecomendaciones } from '@/hooks/useRecomendaciones'
import { useFavorites } from '@/context/FavoritesContext'
import { useCompradorStats } from '@/hooks/useCompradorStats'
import { RecomendacionesGrid } from './RecomendacionesGrid'
import { MisTransaccionesModal } from './MisTransaccionesModal'
import { ProfileCoverHeader, type AccesoRapido } from './ProfileCoverHeader'

interface CompradorDashboardProps {
  user: MockUser
}

export function CompradorDashboard({ user }: CompradorDashboardProps) {
  const { user: authUser } = useAuth()
  const { recomendaciones, loading, error, lastUpdated, refetch } = useRecomendaciones()
  const { openFavoritesModal } = useFavorites()
  const { stats: compradorStats } = useCompradorStats()
  const [modalOpen, setModalOpen] = useState(false)

  const tagline = authUser?.user_metadata?.descripcion || 'Tu estilo, sostenible y único'

  const ACCESOS_RAPIDOS: AccesoRapido[] = [
    { id: 'explorar', icon: Search, label: 'Explorar', href: '/explorar', accent: '#8B5E3C' },
    { id: 'favoritos', icon: Heart, label: 'Favoritos', onClick: openFavoritesModal, accent: '#8B5E3C' },
    { id: 'compras', icon: ShoppingBag, label: 'Mis Compras', onClick: () => setModalOpen(true), accent: '#8B5E3C' },
  ]

  return (
    <>
      <style>{`
        .dash-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 2rem;
          font-family: 'DM Sans', sans-serif;
        }
        
        .dash-section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .dash-section-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 32px;
        }
        
        .dash-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
          color: inherit;
          display: block;
        }
        
        .dash-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        
        .dash-card-image-wrapper {
          height: 240px;
          position: relative;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        
        .dash-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }
        
        .dash-card:hover .dash-card-image {
          transform: scale(1.08);
        }
        
        .dash-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .dash-card:hover .dash-card-overlay {
          opacity: 1;
        }

        .dash-error {
          background: rgba(181, 101, 77, 0.08);
          border: 1px solid rgba(181, 101, 77, 0.25);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .dash-skeleton {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 16px;
          animation: pulse 2s infinite ease-in-out;
        }

        .dash-skeleton-img {
          height: 200px;
          background: var(--bg-secondary);
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .dash-skeleton-line {
          height: 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
          margin-bottom: 12px;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 1024px) {
          .dash-container { padding: 40px 1.5rem; }
          .dash-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        }

        @media (max-width: 640px) {
          .dash-container { padding: 28px 1rem; }
          .dash-greeting { margin-bottom: 28px; padding: 24px 0; }
          .dash-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
          .dash-card-image-wrapper { height: 180px; }
        }

        @media (max-width: 420px) {
          .dash-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-container">
        <ProfileCoverHeader
          name={user.name}
          email={user.email}
          avatarUrl={user.avatar || null}
          stats={[
            { value: compradorStats.compras, label: 'compras' },
            { value: compradorStats.seguidos, label: 'seguidos' },
            { value: compradorStats.seguidores, label: 'seguidores' }
          ]}
          tagline={tagline}
          accesos={ACCESOS_RAPIDOS}
        />
        {/* RECOMENDACIONES */}
        <RecomendacionesGrid
          loading={loading}
          error={error}
          recomendaciones={recomendaciones}
          lastUpdated={lastUpdated}
          refetch={refetch}
        />

        {/* MODAL MIS TRANSACCIONES */}
        <MisTransaccionesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </>
  )
}