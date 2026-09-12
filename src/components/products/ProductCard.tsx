'use client'

import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useFavorites } from '@/context/FavoritesContext'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useRef, useState } from 'react'

export interface Product {
  id: number
  name: string
  price: number
  size: string
  condition: 'Excelente' | 'Muy Bueno' | 'Bueno'
  seller: string
  image: string
  rating: number
  sellerEmail?: string
}

interface ProductCardProps {
  product: Product
  onOpen?: (product: Product) => void
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}

function getConditionStyle(condition: Product['condition']): React.CSSProperties {
  switch (condition) {
    case 'Excelente':
      return { backgroundColor: '#D1FAE5', color: '#065F46' }
    case 'Muy Bueno':
      return { backgroundColor: '#FEF3C7', color: '#92400E' }
    case 'Bueno':
      return { backgroundColor: '#E0E7FF', color: '#3730A3' }
  }
}

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { isFavorito, toggleFavorito } = useFavorites()
  const { addItem, isInCart } = useCart()
  const { user } = useAuth()
  let role = user?.user_metadata?.role || 'comprador'
  if (role === 'buyer') role = 'comprador'
  if (role === 'seller') role = 'vendedor'
  const productId = product.id.toString()
  const isLiked = isFavorito(productId)
  const inCart = isInCart(product.id)

  // ── Tilt 3D + brillo ──────────────────────────────────────
  const cardRef = useRef<HTMLElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width   // 0–1
    const cy = (e.clientY - rect.top) / rect.height   // 0–1
    setTilt({ rx: (cy - 0.5) * -5, ry: (cx - 0.5) * 5 })
    setGlowPos({ x: cx * 100, y: cy * 100 })
  }

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ rx: 0, ry: 0 })
    setGlowPos({ x: 50, y: 50 })
  }
  // ────────────────────────────────────────────────────────────

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorito(productId)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  const handleCardClick = () => {
    onOpen?.(product)
  }

  return (
    <article
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: hovered
          ? '0 20px 40px rgba(44,36,30,0.18)'
          : '0 2px 12px var(--shadow)',
        borderRadius: 20,
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        transition: 'box-shadow 0.35s ease, transform 0.15s ease-out',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transform: hovered
          ? `perspective(700px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-4px) translateZ(0)`
          : 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className="h-full"
    >
      {/* ── Brillo dorado que sigue el cursor ── */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(168,114,77,0.18) 0%, transparent 65%)`,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div style={{ position: 'relative', overflow: 'hidden', height: 230, backgroundColor: 'var(--bg-secondary)', zIndex: 2 }}>
        <Image
          src={product.image}
          alt={`Foto de ${product.name}`}
          width={400}
          height={230}
          className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? 'scale-105' : 'scale-100'}`}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <button
          onClick={handleLike}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            color: isLiked ? '#EC4899' : '#9CA3AF',
          }}
          className="hover:scale-110 hover:bg-white"
          title={isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart size={18} color="currentColor" fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.3 }}
            className="line-clamp-2"
          >
            {product.name}
          </h3>
          <span style={{
            ...getConditionStyle(product.condition),
            fontSize: 11, fontWeight: 700, padding: '4px 10px',
            borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {product.condition}
          </span>
        </div>

        <p style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent)', marginBottom: 20 }}>
          {formatPrice(product.price)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <Link
            href={`/tienda/${encodeURIComponent(product.seller.toLowerCase().replace(/\s+/g, '-'))}`}
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            className="hover:opacity-80 transition-opacity"
            title={`Visitar tienda de ${product.seller}`}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {product.seller.charAt(0)}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {product.seller}
            </span>
          </Link>

          <button
            onClick={handleAddToCart}
            style={{
              backgroundColor: inCart ? '#10B981' : 'var(--accent)',
              color: 'white',
              border: 'none', borderRadius: 12,
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
              transform: 'scale(1)',
            }}
            title={inCart ? 'Ya en el carrito — agregar otro' : 'Añadir al carrito'}
            className="vint-btn-primary"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}