'use client'

import Image from 'next/image'
import { X, ShoppingCart, MessageCircle, Star, Shield, Truck, HeadphonesIcon, Heart, Tag, Ruler } from 'lucide-react'
import { useCart } from '@/components/layout/CartContext'
import { useFavorites } from '@/components/layout/FavoritesContext'
import type { Product } from './ProductCard'
import { useEffect } from 'react'

interface Props {
  product: Product | null
  onClose: () => void
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}

function getConditionStyle(condition: Product['condition']): React.CSSProperties {
  switch (condition) {
    case 'Excelente': return { backgroundColor: '#D1FAE5', color: '#065F46' }
    case 'Muy Bueno': return { backgroundColor: '#FEF3C7', color: '#92400E' }
    case 'Bueno':     return { backgroundColor: '#E0E7FF', color: '#3730A3' }
  }
}

export function ProductDetailModal({ product, onClose }: Props) {
  const { addItem, isInCart } = useCart()
  const { isFavorito, toggleFavorito } = useFavorites()

  const isOpen = product !== null
  const inCart = product ? isInCart(product.id) : false
  const isLiked = product ? isFavorito(product.id.toString()) : false

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!product) return null

  const handleAddToCart = () => {
    addItem(product)
    onClose()
  }

  const handleToggleFav = () => toggleFavorito(product.id.toString())

  // Rating simulado basado en el id del producto
  const rating = (4 + (product.id % 10) / 10).toFixed(1)
  const sales = 10 + (product.id % 90)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeOverlay 0.25s ease forwards',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px 16px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%', maxWidth: 900,
            backgroundColor: 'var(--bg-card)',
            borderRadius: 24,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            display: 'flex',
            overflow: 'hidden',
            maxHeight: '90vh',
            pointerEvents: 'auto',
            animation: 'slideUpModal 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}
        >
          {/* ── LEFT: Image ── */}
          <div style={{
            width: '45%', flexShrink: 0,
            position: 'relative', overflow: 'hidden',
            backgroundColor: 'var(--bg-secondary)',
            minHeight: 480,
          }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 900px) 45vw, 400px"
            />
            {/* Fav button on image */}
            <button
              onClick={handleToggleFav}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 38, height: 38, borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(4px)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                color: isLiked ? '#EC4899' : '#9CA3AF',
                transition: 'all 0.2s',
              }}
              className="detail-fav-btn"
              title={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>

            {/* Condition badge on image */}
            <span style={{
              position: 'absolute', bottom: 14, left: 14,
              ...getConditionStyle(product.condition),
              fontSize: 12, fontWeight: 700,
              padding: '5px 12px', borderRadius: 999,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
              {product.condition}
            </span>
          </div>

          {/* ── RIGHT: Info ── */}
          <div style={{
            flex: 1, overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
            padding: '28px 28px 24px',
          }}>
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <button
                onClick={onClose}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '1px solid var(--border)', background: 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', transition: 'all 0.2s',
                }}
                className="detail-close-btn"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Name + condition */}
            <div style={{ marginBottom: 6 }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 800, fontSize: 'clamp(18px, 2.5vw, 24px)',
                color: 'var(--text-primary)', lineHeight: 1.25,
                margin: '0 0 12px',
              }}>
                {product.name}
              </h2>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                }}>
                  <Tag size={11} /> {product.condition}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                }}>
                  <Ruler size={11} /> Talla {product.size}
                </span>
              </div>
            </div>

            {/* Price */}
            <p style={{
              fontWeight: 900, fontSize: 'clamp(22px, 3vw, 30px)',
              color: 'var(--accent)', margin: '0 0 20px',
              letterSpacing: '-0.5px',
            }}>
              {formatPrice(product.price)}
            </p>

            <div style={{ width: '100%', height: 1, backgroundColor: 'var(--border)', marginBottom: 18 }} />

            {/* Descripción */}
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                Descripción
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Prenda en estado <strong>{product.condition}</strong>, talla <strong>{product.size}</strong>.
                Ideal para cualquier ocasión. Publicada por {product.seller}.
              </p>
            </div>

            {/* Detalles del Producto */}
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10 }}>
                Detalles del Producto
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { icon: '🏷️', label: `Condición: ${product.condition}` },
                  { icon: '✅', label: 'Estado: Disponible' },
                  { icon: '📦', label: 'Envío disponible a toda Colombia' },
                ].map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>{d.icon}</span>
                    <span>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendedor */}
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 14, padding: '14px 16px',
              marginBottom: 20,
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                Vendedor
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  backgroundColor: 'var(--accent)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16, flexShrink: 0,
                }}>
                  {product.seller.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
                    {product.seller}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {rating} · {sales} ventas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones CTA */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1, padding: '13px 20px',
                  backgroundColor: inCart ? '#10B981' : 'var(--accent)',
                  color: 'white', border: 'none', borderRadius: 12,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
                className="detail-cart-btn vint-btn-primary"
              >
                <ShoppingCart size={17} />
                {inCart ? 'Agregar otro' : 'Agregar al Carrito'}
              </button>

              <button
                style={{
                  padding: '13px 18px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 12, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.2s',
                }}
                className="detail-contact-btn vint-btn-secondary"
              >
                <MessageCircle size={16} />
                Contactar
              </button>
            </div>

            {/* Trust badges */}
            <div style={{
              display: 'flex', gap: 6,
              padding: '12px 14px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 12, border: '1px solid var(--border)',
            }}>
              {[
                { icon: <Shield size={16} />, label: 'Compra Protegida' },
                { icon: <Truck size={16} />, label: 'Envío Seguro' },
                { icon: <HeadphonesIcon size={16} />, label: 'Soporte 24/7' },
              ].map(b => (
                <div key={b.label} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  textAlign: 'center',
                }}>
                  <span style={{ color: 'var(--accent)' }}>{b.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.2 }}>
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .detail-close-btn:hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent) !important;
          color: var(--text-primary) !important;
        }
        .detail-fav-btn:hover { transform: scale(1.12); }
        .detail-cart-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .detail-contact-btn:hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }
      `}</style>
    </>
  )
}
