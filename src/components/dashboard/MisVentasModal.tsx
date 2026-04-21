import React from 'react'
import { X, Package, Clock, Filter, Plus } from 'lucide-react'
import Link from 'next/link'

interface MisVentasModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MisVentasModal({ isOpen, onClose }: MisVentasModalProps) {

  if (!isOpen) return null

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: overlayFadeIn 0.3s ease;
          padding: 24px;
        }

        .modal-content {
          background: var(--bg-primary);
          width: 90%;
          max-width: 1400px;
          height: 90vh;
          border-radius: 32px;
          border: 1px solid var(--border);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          overflow: hidden;
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-card);
        }

        .transaction-list {
          padding: 24px 32px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Responsive ─────────────────────────────────────── */
        @media (max-width: 768px) {
          .modal-overlay { padding: 12px; align-items: flex-end; }
          .modal-content { width: 100%; height: 92vh; border-radius: 24px 24px 0 0; max-width: 100%; }
          .modal-header { padding: 20px 20px; }
          .transaction-list { padding: 16px 20px; }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display', serif", margin: '0 0 4px', color: 'var(--text-primary)' }}>
                Mis Ventas
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Historial de tus ventas en Vint
              </p>
            </div>
            <button 
              onClick={onClose}
              style={{
                background: 'var(--bg-secondary)',
                border: 'none',
                width: 40, height: 40,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls */}
          <div style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              borderRadius: 12, border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              <Filter size={16} />
              Filtrar
            </button>
          </div>

          {/* List Content */}
          <div className="transaction-list">
            
            {/* Estado Vacío Estilizado */}
            <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                color: 'var(--accent)', position: 'relative'
              }}>
                <Package size={32} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, width: 24, height: 24,
                  background: 'var(--bg-primary)', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border)'
                }}>
                  <Clock size={12} color="var(--text-muted)" />
                </div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                No hay ventas recientes
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 280, margin: '0 auto 24px', lineHeight: 1.6 }}>
                Aún no has vendido ninguna prenda. ¡Publica tus primeros artículos y empieza a ganar dinero!
              </p>
              
              <Link href="/products?new=true" className="vint-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: 99, fontSize: 14, fontWeight: 700, textDecoration: 'none' }} onClick={onClose}>
                <Plus size={18} /> Publicar Prenda
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
