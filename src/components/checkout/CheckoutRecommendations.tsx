'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, Check } from 'lucide-react'
import { useRecomendaciones } from '@/hooks/useRecomendaciones'
import { useCart } from '@/context/CartContext'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import type { Product } from '@/components/products/ProductCard'
import type { ProductoRecomendado } from '@/types/dashboard'

const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')} COP`

function mapCondicion(condicion: string): Product['condition'] {
  switch (condicion?.toUpperCase()) {
    case 'NUEVO':
    case 'COMO_NUEVO': return 'Excelente'
    case 'USADO': return 'Muy Bueno'
    case 'DESGASTADO': return 'Bueno'
    default: return 'Bueno'
  }
}

function toProduct(item: ProductoRecomendado): Product {
  return {
    id: Number(item.id_prenda),
    name: item.titulo,
    price: Number(item.precio),
    size: item.talla ?? 'U',
    condition: mapCondicion(item.condicion),
    seller: item.vendedor ?? 'Vendedor',
    image: item.imagen_principal,
    rating: 4.5,
  }
}

export function CheckoutRecommendations() {
  const { recomendaciones, loading } = useRecomendaciones()
  const { addItem, isInCart } = useCart()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const getActiveIndex = useCallback(() => {
    const el = scrollRef.current
    if (!el || el.children.length === 0) return 0
    let idx = 0
    let minDiff = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement
      const diff = Math.abs(child.offsetLeft - el.scrollLeft)
      if (diff < minDiff) { minDiff = diff; idx = i }
    }
    return idx
  }, [])

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el || el.children.length === 0) return
    const clamped = Math.max(0, Math.min(index, el.children.length - 1))
    const child = el.children[clamped] as HTMLElement
    el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' })
    setActiveIndex(clamped)
  }, [])

  const scrollTo = useCallback((dir: 'prev' | 'next') => {
    const el = scrollRef.current
    if (!el) return
    const current = getActiveIndex()
    const next = dir === 'next'
      ? (current + 1 >= el.children.length ? 0 : current + 1)
      : (current - 1 < 0 ? el.children.length - 1 : current - 1)
    scrollToIndex(next)
  }, [getActiveIndex, scrollToIndex])

  useEffect(() => {
    if (loading || recomendaciones.length === 0) return
    const el = scrollRef.current
    if (!el) return

    const interval = setInterval(() => {
      if (isPaused) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 5) return
      scrollTo('next')
    }, 4500)

    return () => clearInterval(interval)
  }, [isPaused, loading, recomendaciones.length, scrollTo])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setActiveIndex(getActiveIndex())
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [getActiveIndex, recomendaciones.length])

  const handleOpenProduct = (item: ProductoRecomendado) => {
    setSelectedProduct(toProduct(item))
  }

  const handleAddToCart = (e: React.MouseEvent, item: ProductoRecomendado) => {
    e.preventDefault()
    e.stopPropagation()
    const product = toProduct(item)
    addItem(product, { openDrawer: false })
    setAddedIds(prev => new Set(prev).add(product.id))
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(product.id)
        return next
      })
    }, 2200)
  }

  if (loading) {
    return (
      <div className="checkout-rec-wrap">
        {styles}
        <div className="checkout-rec-header">
          <div className="checkout-rec-header-left">
            <div className="checkout-rec-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="checkout-rec-title">Completa tu estilo</h3>
              <p className="checkout-rec-subtitle">Buscando prendas para ti…</p>
            </div>
          </div>
        </div>
        <div className="checkout-rec-skeleton-row">
          {[1, 2, 3].map(i => (
            <div key={i} className="checkout-rec-skeleton">
              <div className="checkout-rec-skeleton-img" />
              <div className="checkout-rec-skeleton-body">
                <div className="checkout-rec-skeleton-line w-3/4" />
                <div className="checkout-rec-skeleton-line w-1/2 h-4" />
                <div className="checkout-rec-skeleton-line w-full h-2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recomendaciones.length === 0) return null

  return (
    <>
    <div
      className="checkout-rec-wrap"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {styles}

      <div className="checkout-rec-header">
        <div className="checkout-rec-header-left">
          <div className="checkout-rec-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="checkout-rec-title">Completa tu estilo</h3>
            <p className="checkout-rec-subtitle">
              Prendas similares seleccionadas según tu talla y preferencias
            </p>
          </div>
        </div>
        <span className="checkout-rec-count">{recomendaciones.length} sugerencias</span>
      </div>

      <div className="checkout-rec-carousel-wrap">
        <button
          type="button"
          className="checkout-rec-nav checkout-rec-nav-prev"
          onClick={() => scrollTo('prev')}
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={scrollRef} className="checkout-rec-carousel">
          {recomendaciones.map((item) => {
            const productId = Number(item.id_prenda)
            const inCart = isInCart(productId)
            const justAdded = addedIds.has(productId)

            return (
              <article key={item.id_prenda} className="checkout-rec-card">
                <div
                  className="checkout-rec-card-link"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenProduct(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleOpenProduct(item)
                    }
                  }}
                  aria-label={`Ver detalles de ${item.titulo}`}
                >
                  <div className="checkout-rec-img-wrap">
                    {item.imagen_principal ? (
                      <Image
                        src={item.imagen_principal}
                        alt={item.titulo}
                        fill
                        sizes="260px"
                        className="checkout-rec-img"
                      />
                    ) : (
                      <div className="checkout-rec-no-img">Sin imagen</div>
                    )}
                    <div className="checkout-rec-img-overlay" />
                    {item.categoria && (
                      <span className="checkout-rec-badge-cat">{item.categoria}</span>
                    )}
                    {item.talla && (
                      <span className="checkout-rec-badge-size">{item.talla}</span>
                    )}
                  </div>

                  <div className="checkout-rec-body">
                    <h4 className="checkout-rec-name">{item.titulo}</h4>
                    <p className="checkout-rec-price">
                      {formatPrice(item.precio)}
                    </p>
                    {item.razon && (
                      <p className="checkout-rec-reason" title={item.razon}>
                        ✨ {item.razon}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={`checkout-rec-add-btn ${justAdded || inCart ? 'is-added' : ''}`}
                  onClick={(e) => handleAddToCart(e, item)}
                  disabled={inCart && !justAdded}
                  aria-label={inCart ? 'Ya en el carrito' : justAdded ? 'Añadido al carrito' : 'Añadir al carrito'}
                >
                  {inCart || justAdded ? (
                    <>
                      <Check size={14} strokeWidth={3} />
                      {justAdded ? 'Añadido' : 'En carrito'}
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      Añadir
                    </>
                  )}
                </button>
              </article>
            )
          })}
        </div>

        <button
          type="button"
          className="checkout-rec-nav checkout-rec-nav-next"
          onClick={() => scrollTo('next')}
          aria-label="Siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {recomendaciones.length > 1 && (
        <div className="checkout-rec-dots">
          {recomendaciones.map((item, i) => (
            <button
              key={item.id_prenda}
              type="button"
              className={`checkout-rec-dot ${activeIndex === i ? 'is-active' : ''}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Ir a sugerencia ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>

    <ProductDetailModal
      product={selectedProduct}
      onClose={() => setSelectedProduct(null)}
      addToCartOptions={{ openDrawer: false }}
    />
  </>
  )
}

const styles = (
  <style>{`
    .checkout-rec-wrap {
      position: relative;
      width: 100%;
      padding: 28px 24px 24px;
      border-radius: 24px;
      border: 1px solid var(--border);
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--bg-card) 90%, transparent) 0%,
        color-mix(in srgb, var(--accent) 6%, var(--bg-card)) 100%
      );
      box-shadow: 0 8px 32px rgba(139, 94, 60, 0.08);
      display: flex;
      flex-direction: column;
      gap: 20px;
      animation: fadeInUp 0.5s ease forwards;
      overflow: hidden;
    }

    .checkout-rec-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding: 0 4px;
    }

    .checkout-rec-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .checkout-rec-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 6px 16px rgba(139, 94, 60, 0.3);
    }

    .checkout-rec-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .checkout-rec-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 2px 0 0;
      line-height: 1.4;
    }

    .checkout-rec-count {
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      padding: 5px 10px;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .checkout-rec-carousel-wrap {
      position: relative;
    }

    .checkout-rec-carousel {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      padding: 4px 4px 8px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .checkout-rec-carousel::-webkit-scrollbar { display: none; }

    .checkout-rec-card {
      flex: 0 0 240px;
      min-width: 240px;
      scroll-snap-align: start;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s, border-color 0.25s;
    }
    .checkout-rec-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 32px rgba(139, 94, 60, 0.14);
      border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
    }

    .checkout-rec-card-link {
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      flex: 1;
      cursor: pointer;
    }

    .checkout-rec-img-wrap {
      position: relative;
      height: 180px;
      background: var(--bg-secondary);
      overflow: hidden;
    }

    .checkout-rec-img {
      object-fit: cover;
      transition: transform 0.55s ease;
    }
    .checkout-rec-card:hover .checkout-rec-img {
      transform: scale(1.06);
    }

    .checkout-rec-img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    .checkout-rec-card:hover .checkout-rec-img-overlay { opacity: 1; }

    .checkout-rec-no-img {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .checkout-rec-badge-cat {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.6);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 999px;
      backdrop-filter: blur(4px);
      text-transform: capitalize;
      z-index: 1;
    }

    .checkout-rec-badge-size {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--accent);
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 9px;
      border-radius: 999px;
      z-index: 1;
    }

    .checkout-rec-body {
      padding: 14px 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .checkout-rec-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .checkout-rec-price {
      font-size: 14px;
      font-weight: 900;
      color: var(--accent);
      margin: 2px 0 0;
    }

    .checkout-rec-reason {
      font-size: 11px;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 8px;
      margin: 6px 0 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .checkout-rec-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin: 0 12px 12px;
      padding: 9px 14px;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: white;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s, opacity 0.2s;
    }
    .checkout-rec-add-btn:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .checkout-rec-add-btn:active { transform: scale(0.97); }
    .checkout-rec-add-btn.is-added {
      background: #16a34a;
    }
    .checkout-rec-add-btn:disabled {
      cursor: default;
      opacity: 0.9;
    }
    .checkout-rec-add-btn:disabled:hover {
      filter: none;
      transform: none;
    }

    .checkout-rec-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      color: var(--text-primary);
      box-shadow: 0 4px 14px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }
    .checkout-rec-nav:hover {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      transform: translateY(-50%) scale(1.06);
    }
    .checkout-rec-nav-prev { left: -8px; }
    .checkout-rec-nav-next { right: -8px; }

    .checkout-rec-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding-top: 4px;
    }

    .checkout-rec-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      border: none;
      padding: 0;
      background: var(--border);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .checkout-rec-dot.is-active {
      width: 22px;
      background: var(--accent);
    }

    .checkout-rec-skeleton-row {
      display: flex;
      gap: 16px;
      overflow: hidden;
      padding: 4px;
    }

    .checkout-rec-skeleton {
      flex: 0 0 240px;
      border-radius: 18px;
      border: 1px solid var(--border);
      overflow: hidden;
      background: var(--bg-card);
      animation: pulse 2s infinite ease-in-out;
    }

    .checkout-rec-skeleton-img {
      height: 180px;
      background: var(--bg-secondary);
    }

    .checkout-rec-skeleton-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .checkout-rec-skeleton-line {
      height: 10px;
      background: var(--bg-secondary);
      border-radius: 6px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }

    @media (max-width: 640px) {
      .checkout-rec-wrap { padding: 20px 16px 18px; }
      .checkout-rec-card { flex: 0 0 78%; min-width: 78%; }
      .checkout-rec-nav { display: none; }
      .checkout-rec-count { display: none; }
    }
  `}</style>
)
