'use client'

import { Search, Heart, ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { type MockUser } from '@/lib/supabase/mock-user'
import { useRecomendaciones } from '@/hooks/useRecomendaciones'
import { useFavorites } from '@/context/FavoritesContext'
import { DashboardNavbar, AccesoRapido } from './DashboardNavbar'
import { RecomendacionesGrid } from './RecomendacionesGrid'
import { MisTransaccionesModal } from './MisTransaccionesModal'

interface CompradorDashboardProps {
  user: MockUser
}

export function CompradorDashboard({ user }: CompradorDashboardProps) {
  const { recomendaciones, loading, error } = useRecomendaciones()
  const { openFavoritesModal } = useFavorites()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'privado' | 'publico'>('privado')
  const [messageIndex, setMessageIndex] = useState(0)

  const username = user.name.toLowerCase().replace(/\s+/g, '-')

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  const messages = [
    `${saludo}`,
    '¿Listo para cazar tesoros vintage?',
    'Tu estilo, sostenible y único',
    'Explora prendas increíbles hoy'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [messages.length])

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
        
        .dash-greeting {
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          margin-bottom: 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .dash-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 999px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        
        .dash-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.1;
          margin: 0 0 16px;
        }

        .dash-title-accent {
          background: linear-gradient(135deg, var(--accent) 0%, #A8724D 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .dash-tabs {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
          background: var(--bg-card);
          padding: 8px;
          border-radius: 20px;
          border: 1px solid var(--border);
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
        }

        .dash-tab {
          padding: 12px 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          background: transparent;
          color: var(--text-muted);
        }

        .dash-tab.active {
          background: var(--bg-secondary);
          color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .dash-tab:hover:not(.active) {
          color: var(--text-primary);
        }
        
        .buyer-level-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: rgba(139,94,60,0.06);
          border: 1px solid rgba(139,94,60,0.15);
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 16px;
          backdrop-filter: blur(8px);
          transition: all 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .buyer-level-badge:hover {
          background: rgba(139,94,60,0.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139,94,60,0.1);
        }

        .message-slide {
          animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dash-greeting-dynamic {
          margin-bottom: 40px;
          margin-top: -20px;
          position: relative;
          padding: 60px 40px;
          border-radius: 32px;
          border: 1px solid var(--border);
          background: linear-gradient(-45deg, var(--bg-card), var(--bg-secondary), var(--bg-primary), var(--bg-secondary));
          background-size: 400% 400%;
          animation: animatedGradient 12s ease infinite;
          overflow: hidden;
        }

        .dynamic-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 900;
          margin: 0 auto 20px;
          box-shadow: 0 8px 24px rgba(139,94,60,0.15);
          border: 4px solid var(--bg-primary);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
        }

        .dash-greeting-dynamic:hover .dynamic-avatar {
          transform: scale(1.05) translateY(-4px);
          box-shadow: 0 16px 32px rgba(139,94,60,0.25);
          border-color: rgba(250,244,236,0.9);
        }

        @keyframes animatedGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
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
        {/* GREETING SECTION DINÁMICO */}
        <div className="dash-greeting-dynamic">
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute', top: '20%', left: '30%',
            width: '40%', height: '60%', background: 'var(--accent)', filter: 'blur(100px)', opacity: 0.03,
            zIndex: 0, pointerEvents: 'none'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            {/* Avatar Premium Interactivo */}
            <div className="dynamic-avatar">
              {user.name.charAt(0)}
            </div>
            
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1
            }}>
              {user.name}
            </h1>

            {/* Etiqueta con Mensajes Rotativos */}
            <div className="buyer-level-badge">
              <span key={messageIndex} className="message-slide">
                {messages[messageIndex]}
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${activeTab === 'privado' ? 'active' : ''}`}
            onClick={() => setActiveTab('privado')}
          >
            Mi Zona Privada
          </button>
          <button
            className={`dash-tab ${activeTab === 'publico' ? 'active' : ''}`}
            onClick={() => setActiveTab('publico')}
          >
            Mi Armario (Vista Previa)
          </button>
        </div>

        {activeTab === 'privado' ? (
          <>
            {/* NAVBAR INTERACTIVA (Accesos Rápidos) */}
            <DashboardNavbar accesos={ACCESOS_RAPIDOS} />

            {/* RECOMENDACIONES */}
            <RecomendacionesGrid
              loading={loading}
              error={error}
              recomendaciones={recomendaciones}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 24, border: '1px dashed var(--border)' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Este es tu Armario Público
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px' }}>
              Aquí es donde otros usuarios verán tus colecciones, tu estilo y tu impacto ecológico.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <a
                href={`/armario/${username}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 14,
                  backgroundColor: 'var(--accent)', color: 'white',
                  fontSize: 15, fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.2s', boxShadow: '0 8px 16px -4px rgba(139,94,60,0.3)'
                }}
                className="hover:scale-105"
              >
                Ver cómo lo ven los demás
              </a>
            </div>
          </div>
        )}

        {/* MODAL MIS TRANSACCIONES */}
        <MisTransaccionesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </>
  )
}