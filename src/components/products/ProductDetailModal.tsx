'use client'

import Image from 'next/image'
import { X, ShoppingCart, MessageCircle, Star, Shield, Truck, HeadphonesIcon, Heart, Tag, Ruler } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import type { Product } from './ProductCard'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/context/AuthContext'
import { ChatModal } from '@/components/chat/ChatModal'

interface Props {
  product: Product | null
  onClose: () => void
  addToCartOptions?: { openDrawer?: boolean }
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

export function ProductDetailModal({ product, onClose, addToCartOptions }: Props) {
  const { addItem, isInCart } = useCart()
  const { isFavorito, toggleFavorito } = useFavorites()
  const { user } = useAuth()
  const [chatOpen, setChatOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  let role = user?.user_metadata?.role || 'comprador'
  if (role === 'buyer') role = 'comprador'
  if (role === 'seller') role = 'vendedor'

  const isOpen = product !== null
  const inCart = product ? isInCart(product.id) : false
  const isLiked = product ? isFavorito(product.id.toString()) : false
  const isMyProduct = user?.email && product?.sellerEmail && user.email === product.sellerEmail

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!product || !mounted) return null

  const handleAddToCart = () => {
    addItem(product, addToCartOptions)
    onClose()
  }

  const handleToggleFav = () => toggleFavorito(product.id.toString())

  const rating = (4 + (product.id % 10) / 10).toFixed(1)
  const sales = 10 + (product.id % 90)

  const modalContent = (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="product-detail-overlay"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="product-detail-shell"
      >
        <div className="product-detail-modal">
          {/* ── LEFT: Image ── */}
          <div className="product-detail-image">
            <Image
              src={product.image}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="280px"
            />
            <button
              onClick={handleToggleFav}
              className="detail-fav-btn product-detail-fav"
              title={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </button>

            <span
              className="product-detail-condition"
              style={getConditionStyle(product.condition)}
            >
              {product.condition}
            </span>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="product-detail-info">
            <div className="product-detail-close-wrap">
              <button
                onClick={onClose}
                className="detail-close-btn product-detail-close"
                aria-label="Cerrar"
              >
                <X size={15} />
              </button>
            </div>

            <div className="product-detail-head">
              <h2 className="product-detail-title">{product.name}</h2>
              <div className="product-detail-tags">
                <span className="product-detail-tag">
                  <Tag size={11} /> {product.condition}
                </span>
                <span className="product-detail-tag">
                  <Ruler size={11} /> Talla {product.size}
                </span>
              </div>
            </div>

            <p className="product-detail-price">{formatPrice(product.price)}</p>
            <div className="product-detail-divider" />

            <div className="product-detail-section">
              <h3>Descripción</h3>
              <p>
                Prenda en estado <strong>{product.condition}</strong>, talla <strong>{product.size}</strong>.
                Ideal para cualquier ocasión. Publicada por {product.seller}.
              </p>
            </div>

            <div className="product-detail-section">
              <h3>Detalles del Producto</h3>
              <div className="product-detail-list">
                {[
                  { icon: '🏷️', label: `Condición: ${product.condition}` },
                  { icon: '✅', label: 'Estado: Disponible' },
                  { icon: '📦', label: 'Envío disponible a toda Colombia' },
                ].map(d => (
                  <div key={d.label} className="product-detail-list-item">
                    <span>{d.icon}</span>
                    <span>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={`/tienda/${encodeURIComponent(product.seller.toLowerCase().replace(/\s+/g, '-'))}`}
              onClick={onClose}
              className="product-detail-seller"
            >
              <p className="product-detail-seller-label">Vendedor</p>
              <div className="product-detail-seller-row">
                <div className="product-detail-seller-avatar">
                  {product.seller.charAt(0)}
                </div>
                <div>
                  <p className="product-detail-seller-name">{product.seller}</p>
                  <div className="product-detail-seller-meta">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" />
                    <span>{rating} · {sales} ventas</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="product-detail-actions">
              {role !== 'vendedor' && (
                <button
                  onClick={handleAddToCart}
                  className="detail-cart-btn vint-btn-primary product-detail-cart-btn"
                >
                  <ShoppingCart size={16} />
                  {inCart ? 'Agregar otro' : 'Agregar al Carrito'}
                </button>
              )}

              {!isMyProduct && (
                <button
                  onClick={() => setChatOpen(true)}
                  className="detail-contact-btn vint-btn-secondary product-detail-contact-btn"
                >
                  <MessageCircle size={15} />
                  Contactar
                </button>
              )}
            </div>

            <div className="product-detail-trust">
              {[
                { icon: <Shield size={14} />, label: 'Compra Protegida' },
                { icon: <Truck size={14} />, label: 'Envío Seguro' },
                { icon: <HeadphonesIcon size={14} />, label: 'Soporte 24/7' },
              ].map(b => (
                <div key={b.label} className="product-detail-trust-item">
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-detail-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background-color: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          animation: fadeOverlay 0.25s ease forwards;
        }

        .product-detail-shell {
          position: fixed;
          inset: 0;
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          pointer-events: none;
        }

        .product-detail-modal {
          width: 100%;
          max-width: 680px;
          background-color: var(--bg-card);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.28);
          display: flex;
          overflow: hidden;
          max-height: 82vh;
          pointer-events: auto;
          animation: slideUpModal 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }

        .product-detail-image {
          width: 42%;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          background-color: var(--bg-secondary);
          min-height: 320px;
        }

        .product-detail-fav {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.88);
          backdrop-filter: blur(4px);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          color: ${isLiked ? '#EC4899' : '#9CA3AF'};
          transition: all 0.2s;
        }

        .product-detail-condition {
          position: absolute;
          bottom: 12px;
          left: 12px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .product-detail-info {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 18px 20px 16px;
          min-width: 0;
        }

        .product-detail-close-wrap {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }

        .product-detail-close {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .product-detail-title {
          font-family: 'Playfair Display', serif;
          font-weight: 800;
          font-size: 18px;
          color: var(--text-primary);
          line-height: 1.25;
          margin: 0 0 10px;
        }

        .product-detail-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .product-detail-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 8px;
        }

        .product-detail-price {
          font-weight: 900;
          font-size: 22px;
          color: var(--accent);
          margin: 0 0 14px;
          letter-spacing: -0.5px;
        }

        .product-detail-divider {
          width: 100%;
          height: 1px;
          background-color: var(--border);
          margin-bottom: 14px;
        }

        .product-detail-section {
          margin-bottom: 14px;
        }

        .product-detail-section h3 {
          font-weight: 700;
          font-size: 13px;
          color: var(--text-primary);
          margin: 0 0 5px;
        }

        .product-detail-section p {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
        }

        .product-detail-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .product-detail-list-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .product-detail-seller {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 14px;
          background-color: var(--bg-secondary);
          display: block;
          text-decoration: none;
          transition: all 0.2s;
        }

        .product-detail-seller:hover {
          transform: scale(1.01);
          border-color: var(--accent);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .product-detail-seller-label {
          font-weight: 700;
          font-size: 12px;
          color: var(--text-primary);
          margin: 0 0 8px;
        }

        .product-detail-seller-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .product-detail-seller-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          flex-shrink: 0;
        }

        .product-detail-seller-name {
          font-weight: 700;
          font-size: 13px;
          color: var(--text-primary);
          margin: 0;
        }

        .product-detail-seller-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .product-detail-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .product-detail-cart-btn {
          flex: 1;
          padding: 11px 16px;
          background-color: ${inCart ? '#10B981' : 'var(--accent)'};
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }

        .product-detail-contact-btn {
          padding: 11px 14px;
          background-color: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .product-detail-trust {
          display: flex;
          gap: 6px;
          padding: 10px 12px;
          background-color: var(--bg-secondary);
          border-radius: 10px;
          border: 1px solid var(--border);
        }

        .product-detail-trust-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          text-align: center;
          color: var(--accent);
        }

        .product-detail-trust-item span:last-child {
          font-size: 9px;
          font-weight: 600;
          color: var(--text-muted);
          line-height: 1.2;
        }

        @keyframes fadeOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .detail-close-btn:hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent) !important;
          color: var(--text-primary) !important;
        }
        .detail-fav-btn:hover { transform: scale(1.1); }
        .detail-cart-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .detail-contact-btn:hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }

        @media (max-width: 640px) {
          .product-detail-shell {
            align-items: flex-end;
            padding: 0;
          }
          .product-detail-modal {
            max-width: 100%;
            max-height: 92vh;
            border-radius: 20px 20px 0 0;
            flex-direction: column;
          }
          .product-detail-image {
            width: 100%;
            min-height: 220px;
            max-height: 38vh;
          }
        }
      `}</style>

      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        sellerName={product.seller}
        sellerSlug={product.seller.toLowerCase().replace(/\s+/g, '-')}
        sellerEmail={product.sellerEmail}
      />
    </>
  )

  return createPortal(modalContent, document.body)
}
