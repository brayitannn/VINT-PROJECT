import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

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
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering article click
    addItem(product)
  }

  return (
    <article
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px var(--shadow)',
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="hover:-translate-y-2 hover:shadow-2xl group"
    >
      <div style={{ overflow: 'hidden', height: 200, backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
        <Image
          src={product.image}
          alt={`Foto de ${product.name}`}
          width={400}
          height={200}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Hover overlay item feedback could go here */}
      </div>

      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.3 }}
            className="line-clamp-1 flex-1"
          >
            {product.name}
          </h3>
          <span style={{
            ...getConditionStyle(product.condition),
            fontSize: 11, fontWeight: 600, padding: '4px 10px',
            borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {product.condition}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontWeight: 800, fontSize: 19, color: 'var(--accent)', margin: 0 }}>
            {formatPrice(product.price)}
          </p>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Talla {product.size}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
              border: '1px solid var(--border)',
            }}>
              {product.seller.charAt(0)}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {product.seller}
            </span>
          </div>

          <button
            onClick={handleAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)',
              border: 'none', padding: '10px 14px', borderRadius: 12,
              cursor: 'pointer', transition: 'all 0.2s',
              fontSize: 13, fontWeight: 700,
            }}
            className="hover:scale-105 active:scale-95"
          >
            <ShoppingCart size={15} strokeWidth={2.5} />
            Añadir
          </button>
        </div>
      </div>
    </article>
  )
}