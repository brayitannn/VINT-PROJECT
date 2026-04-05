import Image from 'next/image'

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
      }}
      className="hover:-translate-y-1 hover:shadow-lg"
    >
      <div style={{ overflow: 'hidden', height: 200, backgroundColor: 'var(--bg-secondary)' }}>
        <Image
          src={product.image}
          alt={`Foto de ${product.name}`}
          width={400}
          height={200}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div style={{ padding: 20 }}>
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

        <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)', marginBottom: 12 }}>
          {formatPrice(product.price)}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, flexShrink: 0,
          }}>
            {product.seller.charAt(0)}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {product.seller}
          </span>
        </div>
      </div>
    </article>
  )
}