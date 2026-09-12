'use client'

import React, { useEffect } from 'react'
import { X, Edit3, RotateCcw, Tag, Ruler, Sparkles, Package, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import type { Product } from '@/types/product'

interface ProductViewModalProps {
  product: Product | null
  onClose: () => void
  onEdit: (product: Product) => void
  onReactivar: (product: Product) => void
}

function formatPrice(price: number): string {
  return `$${Number(price || 0).toLocaleString('es-CO')} COP`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Reciente'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export function ProductViewModal({ product, onClose, onEdit, onReactivar }: ProductViewModalProps) {
  useEffect(() => {
    if (!product) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [product, onClose])

  if (!product) return null

  const isSold = product.status === 'sold'
  const isPublished = product.status === 'published'

  return (
    <>
      <style>{`
        .pv-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: pvFade 0.25s ease;
        }

        .pv-container {
          background: var(--bg-card);
          width: 95%;
          max-width: 920px;
          max-height: 88vh;
          border-radius: 28px;
          border: 1px solid var(--border);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: pvSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pv-body {
          display: grid;
          grid-template-columns: 1.1fr 1.3fr;
          overflow-y: auto;
          flex: 1;
        }

        .pv-image-col {
          background: var(--bg-secondary);
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-right: 1px solid var(--border);
        }

        .pv-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .pv-image:hover {
          transform: scale(1.03);
        }

        .pv-info-col {
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }

        .pv-badge-sold {
          background: #ede9fe;
          color: #6d28d9;
          border: 1px solid rgba(109, 40, 217, 0.3);
        }

        .pv-badge-published {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid rgba(21, 128, 61, 0.3);
        }

        .pv-badge-draft {
          background: #fef9c3;
          color: #a16207;
          border: 1px solid rgba(161, 98, 7, 0.3);
        }

        .pv-chip {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .pv-chip-lbl {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 700;
        }

        .pv-chip-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        @keyframes pvFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pvSlide {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
          .pv-overlay { padding: 0; align-items: flex-end; }
          .pv-container { width: 100%; max-height: 94vh; border-radius: 24px 24px 0 0; }
          .pv-body { grid-template-columns: 1fr; }
          .pv-image-col { min-height: 280px; max-height: 320px; border-right: none; border-bottom: 1px solid var(--border); }
          .pv-info-col { padding: 24px 20px; }
        }
      `}</style>

      <div className="pv-overlay" onClick={onClose}>
        <div className="pv-container" onClick={(e) => e.stopPropagation()}>
          {/* Header Bar */}
          <div style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vista Previa de Prenda
              </span>
              {product.sku && (
                <span style={{ fontSize: 12, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  SKU: {product.sku}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-secondary)',
                border: 'none',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
              title="Cerrar (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Body */}
          <div className="pv-body">
            {/* Column 1: Big Image */}
            <div className="pv-image-col">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="pv-image" />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={48} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Sin imagen principal</p>
                </div>
              )}

              {/* Status Floating Pill */}
              <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }} className={isSold ? 'pv-badge-sold' : isPublished ? 'pv-badge-published' : 'pv-badge-draft'}>
                {isSold ? '● Vendida' : isPublished ? '● Publicada / En Venta' : '● ' + product.status}
              </div>
            </div>

            {/* Column 2: Information & Specs */}
            <div className="pv-info-col">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {product.category && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {product.category}
                    </span>
                  )}
                  {product.brand && (
                    <>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {product.brand}
                      </span>
                    </>
                  )}
                </div>

                <h1 style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: "'Playfair Display', serif",
                  color: 'var(--text-primary)',
                  margin: '0 0 10px',
                  lineHeight: 1.2
                }}>
                  {product.name}
                </h1>

                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Notice if sold */}
              {isSold && (
                <div style={{
                  background: 'rgba(109, 40, 217, 0.08)',
                  border: '1px solid rgba(109, 40, 217, 0.25)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#6d28d9'
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 13 }}>
                    <strong>Esta prenda figura como Vendida.</strong> Si la compra fue anulada o deseas volver a ofrecerla, puedes reactivarla directamente aquí.
                  </div>
                </div>
              )}

              {/* Grid of Attributes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div className="pv-chip">
                  <span className="pv-chip-lbl">Talla</span>
                  <span className="pv-chip-val">{product.size || 'Única'}</span>
                </div>

                <div className="pv-chip">
                  <span className="pv-chip-lbl">Condición</span>
                  <span className="pv-chip-val capitalize">{product.condition?.replace('_', ' ') || 'Buen estado'}</span>
                </div>

                <div className="pv-chip">
                  <span className="pv-chip-lbl">Color</span>
                  <span className="pv-chip-val">{product.color || 'Varios'}</span>
                </div>

                <div className="pv-chip">
                  <span className="pv-chip-lbl">Género</span>
                  <span className="pv-chip-val">{product.gender || 'UNISEX'}</span>
                </div>

                <div className="pv-chip">
                  <span className="pv-chip-lbl">Stock</span>
                  <span className="pv-chip-val">{product.stock} un.</span>
                </div>

                <div className="pv-chip">
                  <span className="pv-chip-lbl">Publicado</span>
                  <span className="pv-chip-val" style={{ fontSize: 12 }}>{formatDate(product.created_at)}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                  Descripción
                </h4>
                <div style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-secondary)',
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap'
                }}>
                  {product.description || 'Sin descripción adicional para esta prenda.'}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{
                marginTop: 'auto',
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                {isSold && (
                  <button
                    onClick={() => onReactivar(product)}
                    className="vint-btn-primary"
                    style={{
                      padding: '10px 20px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <RotateCcw size={16} />
                    Poner de nuevo en venta
                  </button>
                )}

                <button
                  onClick={() => onEdit(product)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s'
                  }}
                  className="hover:border-[var(--accent)]"
                >
                  <Edit3 size={16} />
                  Modificar Producto
                </button>

                <button
                  onClick={onClose}
                  style={{
                    marginLeft: 'auto',
                    padding: '10px 18px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'none',
                    color: 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
