'use client'

import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { useFavorites } from '@/components/layout/FavoritesContext'

export interface Product {
  id: number
  name: string
  price: number
  size: string
  condition: 'Excelente' | 'Muy Bueno' | 'Bueno'
  seller: string
  image: string
  rating: number
}

interface ProductCardProps {
  product: Product
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

export function ProductCard({ product }: ProductCardProps) {
  const { isFavorito, toggleFavorito } = useFavorites()
  const productId = product.id.toString()
  const isLiked = isFavorito(productId)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorito(productId)
  }

  return (
    <article
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px var(--shadow)',
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column'
      }}
      className="group hover:-translate-y-1 hover:shadow-lg h-full"
    >
      <div style={{ position: 'relative', overflow: 'hidden', height: 230, backgroundColor: 'var(--bg-secondary)' }}>
        <Image
          src={product.image}
          alt={`Foto de ${product.name}`}
          width={400}
          height={230}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

      <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            style={{
              backgroundColor: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 12,
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            title="Añadir al carrito"
            className="hover:scale-105 hover:bg-[var(--accent-hover)] shadow-sm hover:shadow-md"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}