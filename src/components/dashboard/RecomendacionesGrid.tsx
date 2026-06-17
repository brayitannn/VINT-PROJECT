'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from 'lucide-react'
import { ProductoRecomendado } from '@/types/dashboard'

interface RecomendacionesGridProps {
  loading: boolean
  error: string | null
  recomendaciones: ProductoRecomendado[]
  lastUpdated?: Date | null
  refetch?: () => void
}

export function RecomendacionesGrid({
  loading,
  error,
  recomendaciones,
  lastUpdated,
  refetch,
}: RecomendacionesGridProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-avance del carrusel
  useEffect(() => {
    if (loading || recomendaciones.length === 0) return
    const el = carouselRef.current
    if (!el) return

    const interval = setInterval(() => {
      if (isPaused) return

      const children = el.children
      if (children.length <= 1) return

      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 5) return

      let currentIndex = 0
      let minDiff = Infinity
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement
        const diff = Math.abs(child.offsetLeft - el.scrollLeft)
        if (diff < minDiff) { minDiff = diff; currentIndex = i }
      }

      const nextIndex = currentIndex + 1 >= children.length ? 0 : currentIndex + 1
      setActiveIndex(nextIndex)
      if (nextIndex === 0) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const nextChild = children[nextIndex] as HTMLElement
        el.scrollTo({ left: nextChild.offsetLeft, behavior: 'smooth' })
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isPaused, loading, recomendaciones])

  const scrollTo = (dir: 'prev' | 'next') => {
    const el = carouselRef.current
    if (!el) return
    const children = el.children
    let currentIndex = 0
    let minDiff = Infinity
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement
      const diff = Math.abs(child.offsetLeft - el.scrollLeft)
      if (diff < minDiff) { minDiff = diff; currentIndex = i }
    }
    const nextIndex = dir === 'next'
      ? (currentIndex + 1 >= children.length ? 0 : currentIndex + 1)
      : (currentIndex - 1 < 0 ? children.length - 1 : currentIndex - 1)
    setActiveIndex(nextIndex)
    const nextChild = children[nextIndex] as HTMLElement
    el.scrollTo({ left: nextChild.offsetLeft, behavior: 'smooth' })
  }

  const handleRefetch = async () => {
    if (!refetch || isRefreshing) return
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 800)
  }

  const formatLastUpdated = (date: Date | null | undefined) => {
    if (!date) return null
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 10) return 'Actualizado ahora'
    if (diff < 60) return `Hace ${diff}s`
    const mins = Math.floor(diff / 60)
    return `Hace ${mins} min`
  }

  return (
    <div style={{ animation: 'fadeIn 0.8s ease forwards 0.4s', opacity: 0 }}>
      <style>{`
        .rec-carousel-wrap {
          position: relative;
        }
        .rec-carousel {
          display: flex;
          overflow-x: auto;
          gap: 20px;
          list-style: none;
          padding: 12px 4px 28px 4px;
          margin: 0 -4px;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .rec-carousel::-webkit-scrollbar { display: none; }

        .rec-card {
          flex: 0 0 calc(33.333% - 14px);
          min-width: 260px;
          max-width: 320px;
          scroll-snap-align: start;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;
        }
        .rec-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .rec-card-img {
          height: 220px;
          position: relative;
          overflow: hidden;
          background: var(--bg-secondary);
          flex-shrink: 0;
        }
        .rec-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .rec-card:hover .rec-card-img img {
          transform: scale(1.07);
        }
        .rec-card-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .rec-card:hover .rec-card-img-overlay { opacity: 1; }

        .rec-card-body {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .rec-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-70%);
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          color: var(--text-primary);
        }
        .rec-nav-btn:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          transform: translateY(-70%) scale(1.08);
        }
        .rec-nav-prev { left: -16px; }
        .rec-nav-next { right: -16px; }

        .rec-skeleton {
          flex: 0 0 calc(33.333% - 14px);
          min-width: 260px;
          max-width: 320px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          animation: pulse 2s infinite ease-in-out;
        }
        .rec-skeleton-img { height: 220px; background: var(--bg-secondary); }
        .rec-skeleton-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
        .rec-skeleton-line {
          height: 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        @media (max-width: 768px) {
          .rec-card { flex: 0 0 80%; }
          .rec-nav-btn { display: none; }
        }
        @media (max-width: 480px) {
          .rec-card { flex: 0 0 90%; }
        }
      `}</style>

      {/* Header */}
      <div className="dash-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="dash-section-icon" style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(139, 94, 60, 0.25)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Recomendado para ti
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              Basado en tus favoritos, búsquedas y preferencias
              {lastUpdated && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  · {formatLastUpdated(lastUpdated)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Botón de actualizar: solo icono */}
        {refetch && (
          <button
            onClick={handleRefetch}
            title="Actualizar recomendaciones"
            aria-label="Actualizar recomendaciones"
            style={{
              width: 38, height: 38,
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isRefreshing ? 'default' : 'pointer',
              color: isRefreshing ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
            className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <RefreshCw
              size={16}
              style={{
                transition: 'transform 0.7s ease',
                transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        )}
      </div>

      {/* Skeleton loader */}
      {loading && (
        <div style={{ display: 'flex', gap: 20, overflow: 'hidden', padding: '12px 4px 28px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="rec-skeleton">
              <div className="rec-skeleton-img" />
              <div className="rec-skeleton-body">
                <div className="rec-skeleton-line" style={{ width: '75%' }} />
                <div className="rec-skeleton-line" style={{ width: '40%', height: 18 }} />
                <div className="rec-skeleton-line" style={{ width: '100%', height: 8, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="dash-error">
          <div style={{ padding: 16, background: 'rgba(181, 101, 77, 0.15)', borderRadius: '50%' }}>
            <AlertCircle size={36} color="#B5654D" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#A85741', margin: 0 }}>Algo salió mal</h3>
          <p style={{ color: '#C86A58', margin: 0, maxWidth: 400 }}>{error}</p>
          {refetch && (
            <button onClick={handleRefetch} style={{ marginTop: 8, padding: '10px 24px', borderRadius: 12, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              Intentar de nuevo
            </button>
          )}
        </div>
      )}

      {/* Carrusel */}
      {!loading && !error && recomendaciones.length > 0 && (
        <div className="rec-carousel-wrap">
          {/* Botón Anterior */}
          <button className="rec-nav-btn rec-nav-prev" onClick={() => scrollTo('prev')} aria-label="Anterior">
            <ChevronLeft size={20} />
          </button>

          <div
            ref={carouselRef}
            className="rec-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {recomendaciones.map((prenda, idx) => (
              <Link
                key={prenda.id_prenda}
                href="/explorar"
                className="rec-card"
              >
                {/* Imagen */}
                <div className="rec-card-img">
                  {prenda.imagen_principal ? (
                    <img src={prenda.imagen_principal} alt={prenda.titulo} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      Sin imagen
                    </div>
                  )}
                  <div className="rec-card-img-overlay" />
                  {/* Badge de categoría */}
                  {prenda.categoria && (
                    <span style={{
                      position: 'absolute', top: 12, left: 12,
                      background: 'rgba(0,0,0,0.55)', color: 'white',
                      fontSize: 11, fontWeight: 700, padding: '4px 10px',
                      borderRadius: 999, backdropFilter: 'blur(4px)',
                      textTransform: 'capitalize',
                    }}>
                      {prenda.categoria}
                    </span>
                  )}
                  {/* Badge de talla */}
                  {prenda.talla && (
                    <span style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'var(--accent)', color: 'white',
                      fontSize: 11, fontWeight: 800, padding: '4px 10px',
                      borderRadius: 999,
                    }}>
                      {prenda.talla}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="rec-card-body">
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.3 }}
                    className="line-clamp-2"
                  >
                    {prenda.titulo}
                  </h3>

                  <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', margin: '0 0 12px' }}>
                    ${Number(prenda.precio).toLocaleString('es-CO')}
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 4 }}>COP</span>
                  </p>

                  {prenda.razon && (
                    <p style={{
                      fontSize: 12,
                      color: 'var(--accent)',
                      background: 'var(--bg-secondary)',
                      padding: '7px 11px',
                      borderRadius: 10,
                      marginTop: 'auto',
                      fontWeight: 500,
                      lineHeight: 1.4,
                      border: '1px solid var(--border)',
                    }}>
                      ✨ {prenda.razon}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Botón Siguiente */}
          <button className="rec-nav-btn rec-nav-next" onClick={() => scrollTo('next')} aria-label="Siguiente">
            <ChevronRight size={20} />
          </button>

          {/* Dots de paginación */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            {recomendaciones.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = carouselRef.current
                  if (!el) return
                  const child = el.children[i] as HTMLElement
                  el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' })
                  setActiveIndex(i)
                }}
                style={{
                  width: activeIndex === i ? 20 : 6,
                  height: 6, borderRadius: 999,
                  background: activeIndex === i ? 'var(--accent)' : 'var(--border)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease', padding: 0,
                }}
                aria-label={`Ir a prenda ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && !error && recomendaciones.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 24, border: '1px dashed var(--border)' }}>
          <Heart size={48} color="var(--text-muted)" style={{ marginBottom: 16, opacity: 0.4 }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Aún no hay recomendaciones</h3>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 380, margin: '0 auto 24px' }}>
            Explora la tienda o guarda algunas prendas en favoritos para que podamos personalizar tu selección.
          </p>
          <Link href="/explorar" style={{ padding: '12px 28px', borderRadius: 14, background: 'var(--accent)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
            Ir a Explorar →
          </Link>
        </div>
      )}
    </div>
  )
}
