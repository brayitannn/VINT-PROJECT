'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Sparkles, Heart } from 'lucide-react'
import { useRecomendaciones } from '@/hooks/useRecomendaciones'

const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`

export function CheckoutRecommendations() {
  const { recomendaciones, loading } = useRecomendaciones()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Desplazamiento automático cada 4 segundos
  useEffect(() => {
    const container = scrollRef.current
    if (!container || recomendaciones.length === 0) return

    const interval = setInterval(() => {
      if (isHovered) return
      
      const maxScroll = container.scrollWidth - container.clientWidth
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        container.scrollBy({ left: 240, behavior: 'smooth' })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [recomendaciones, isHovered])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return
    const offset = direction === 'left' ? -240 : 240
    container.scrollBy({ left: offset, behavior: 'smooth' })
  }

  if (loading || recomendaciones.length === 0) return null

  return (
    <div 
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 75%, transparent)',
        borderColor: 'var(--border)',
        padding: '32px 24px',
        position: 'relative'
      }}
      className="border rounded-3xl shadow-lg w-full flex flex-col gap-6 animate-fade-in-up overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {styleTag}

      {/* Cabecera del Carrusel */}
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[rgba(139,94,60,0.1)] flex items-center justify-center text-[var(--accent)] animate-pulse">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">
              Completa tu estilo
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Prendas similares y de tu estilo seleccionadas para ti
            </p>
          </div>
        </div>

        {/* Flechas de Navegación */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            style={{ borderColor: 'var(--border)' }}
            className="w-8 h-8 rounded-full bg-white dark:bg-[var(--bg-card)] border flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            style={{ borderColor: 'var(--border)' }}
            className="w-8 h-8 rounded-full bg-white dark:bg-[var(--bg-card)] border flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Contenedor del Scroll del Carrusel */}
      <div 
        ref={scrollRef}
        className="w-full flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          scrollBehavior: 'smooth'
        }}
      >
        {recomendaciones.map((item) => (
          <a
            key={item.id_prenda}
            href={`/products/${item.id_prenda}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border)',
              minWidth: '220px',
              maxWidth: '220px'
            }}
            className="checkout-recommendation-card border rounded-2xl flex flex-col overflow-hidden snap-start flex-shrink-0 cursor-pointer shadow-sm transition-all duration-300"
          >
            {/* Contenedor de Imagen */}
            <div className="w-full h-44 bg-[var(--bg-secondary)]/50 relative overflow-hidden group">
              {item.imagen_principal ? (
                <Image 
                  src={item.imagen_principal} 
                  alt={item.titulo} 
                  fill 
                  sizes="220px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs font-semibold">
                  Sin imagen
                </div>
              )}
              {/* Tag de Categoría / Estilo */}
              <div className="absolute top-2 left-2 bg-white/95 dark:bg-[var(--bg-card)]/95 backdrop-blur-md px-2 py-0.5 rounded-lg border border-[var(--border)] text-[9px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                {item.categoria || 'Moda'}
              </div>
            </div>

            {/* Información del Producto */}
            <div className="p-3.5 flex flex-col gap-1 w-full text-left">
              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                {item.titulo}
              </h4>
              
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs font-black text-[var(--accent)]">
                  {formatPrice(item.precio)}
                </span>
                <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)]/60 px-1.5 py-0.5 rounded-md">
                  Talla {item.talla || 'U'}
                </span>
              </div>

              {/* Razón de recomendación sutil */}
              <p className="text-[9px] text-[var(--text-secondary)] italic leading-tight mt-1.5 truncate">
                {item.razon || 'Elegido especialmente para complementar tu estilo.'}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// Estilos CSS locales inyectados de forma segura
const styleTag = (
  <style>{`
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .checkout-recommendation-card {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .checkout-recommendation-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 20px -8px rgba(139, 94, 60, 0.2);
      border-color: var(--accent) !important;
    }
  `}</style>
)
