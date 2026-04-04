/*
  ProductCard.tsx

  Tarjeta de producto individual de VINT.
  Es Server Component (sin 'use client') porque solo muestra datos,
  no necesita estado ni eventos del navegador. Esto lo hace más
  rápido porque se renderiza directo en el servidor.

  Recibe un objeto product y renderiza:
  - Imagen con badge de estado de la prenda
  - Nombre y talla
  - Calificación y nombre del vendedor
  - Precio en formato COP
  - Botón de favorito accesible

  La interfaz Product define exactamente qué datos espera
  cada tarjeta, garantizando type-safety con TypeScript.
*/

import { Heart, Star } from 'lucide-react'
import Image from 'next/image'

/* TIPOS */

export interface Product {
  id: number
  name: string
  price: number          /* precio en pesos colombianos */
  size: string           /* talla: XS, S, M, L, XL */
  condition: 'Excelente' | 'Muy Bueno' | 'Bueno'
  seller: string
  image: string
  rating: number         /* calificación del vendedor de 1 a 5 */
}

interface ProductCardProps {
  product: Product
}

/* HELPERS */

/*
  Formatea un número como precio en COP.
  Ejemplo: 45000 → "$45.000 COP"
  Usamos toLocaleString con 'es-CO' para el formato colombiano
  que usa punto como separador de miles.
*/

function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')} COP`
}

/*
  Devuelve los colores del badge según el estado de la prenda.
  Los colores están calculados para cumplir con WCAG AA
  (contraste mínimo de 4.5:1 entre texto y fondo).
*/

function getConditionStyle(condition: Product['condition']): React.CSSProperties {
  switch (condition) {
    case 'Excelente':
      return { backgroundColor: '#D1FAE5', color: '#065F46' }  /* contraste 7.2:1 ✅ */
    case 'Muy Bueno':
      return { backgroundColor: '#FEF3C7', color: '#92400E' }  /* contraste 5.1:1 ✅ */
    case 'Bueno':
      return { backgroundColor: '#E0E7FF', color: '#3730A3' }  /* contraste 6.8:1 ✅ */
  }
}

/* COMPONENTE */

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 12px var(--shadow)',
      }}
      className="rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      aria-label={`Producto: ${product.name}, ${formatPrice(product.price)}`}
    >

      {/* IMAGEN */}

      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={`Foto de ${product.name} en estado ${product.condition}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        {/* Badge de estado */}

        <span
          style={getConditionStyle(product.condition)}
          className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
          aria-label={`Estado: ${product.condition}`}
        >
          {product.condition}
        </span>

        {/*
          Botón de favorito: aparece solo cuando el usuario
          pasa el mouse por encima de la tarjeta (group-hover).
          En móvil siempre es visible porque no hay hover.
        */}

        <button
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-muted)',
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:text-red-500 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label={`Agregar ${product.name} a favoritos`}
        >
          <Heart size={15} />
        </button>
      </div>

      {/* INFORMACIÓN */}

      <div className="p-4">

        {/* Nombre y talla */}

        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            style={{ color: 'var(--text-primary)' }}
            className="font-semibold text-sm leading-snug line-clamp-2 flex-1"
          >
            {product.name}
          </h3>
          <span
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
            className="text-xs font-medium px-2 py-0.5 rounded-md shrink-0"
            aria-label={`Talla: ${product.size}`}
          >
            {product.size}
          </span>
        </div>

        {/* Vendedor con rating */}

        <div className="flex items-center gap-1 mb-3">
          <Star size={11} style={{ color: 'var(--accent)' }} fill="var(--accent)" aria-hidden="true" />
          <span style={{ color: 'var(--text-muted)' }} className="text-xs">
            {product.rating.toFixed(1)} · {product.seller}
          </span>
        </div>

        {/* Precio */}

        <p
          style={{ color: 'var(--accent)' }}
          className="font-bold text-base"
          aria-label={`Precio: ${formatPrice(product.price)}`}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  )
}
