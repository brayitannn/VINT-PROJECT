'use client'

import { X, Heart, ShoppingCart, Star } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useFavorites } from '@/components/layout/FavoritesContext'
import { createClient } from '@/lib/supabase/client'

interface ProductoFavorito {
  id_prenda: string
  titulo: string
  precio: number
  imagen_url: string
  talla?: string
  condicion: 'Excelente' | 'Muy Bueno' | 'Bueno'
  vendedor: string
  rating: number
}

type Condicion = 'Excelente' | 'Muy Bueno' | 'Bueno'

// Datos de display para prendas (ampliable cuando haya tabla real)
const PRODUCT_META: Record<string, Omit<ProductoFavorito, 'id_prenda'>> = {
  '1': { titulo: 'Chaqueta de Cuero Vintage', precio: 85000, imagen_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=500&auto=format&fit=crop', talla: 'M', condicion: 'Excelente', vendedor: 'La Tienda de Ana', rating: 4.9 },
  '2': { titulo: 'Jeans 501 Classic', precio: 120000, imagen_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=500&auto=format&fit=crop', talla: '32', condicion: 'Muy Bueno', vendedor: 'Moda Urbana', rating: 4.7 },
  '3': { titulo: 'Suéter de Lana Tejido', precio: 65000, imagen_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=500&auto=format&fit=crop', talla: 'L', condicion: 'Excelente', vendedor: 'El Armario de Karen', rating: 4.8 },
  '4': { titulo: 'Bolso de Cuero Artesanal', precio: 150000, imagen_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=500&auto=format&fit=crop', talla: 'U', condicion: 'Bueno', vendedor: 'Artisan Bags', rating: 4.5 },
  '5': { titulo: 'Gafas de Sol Retro', precio: 45000, imagen_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=500&auto=format&fit=crop', talla: 'U', condicion: 'Excelente', vendedor: 'Vintage Eyes', rating: 4.6 },
  '6': { titulo: 'Trench Coat Clásico', precio: 195000, imagen_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop', talla: 'S', condicion: 'Muy Bueno', vendedor: 'Closet Premium', rating: 4.8 },
}

function getConditionStyle(condition: Condicion): React.CSSProperties {
  switch (condition) {
    case 'Excelente': return { backgroundColor: '#D1FAE5', color: '#065F46' }
    case 'Muy Bueno': return { backgroundColor: '#FEF3C7', color: '#92400E' }
    case 'Bueno': return { backgroundColor: '#E0E7FF', color: '#3730A3' }
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function FavoritesModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const { favoriteIds, toggleFavorito, loading } = useFavorites()

  // Build display list from context IDs + product metadata
  const favoritos: ProductoFavorito[] = Array.from(favoriteIds)
    .map((id) => {
      const meta = PRODUCT_META[id]
      if (!meta) return null
      return { id_prenda: id, ...meta }
    })
    .filter(Boolean) as ProductoFavorito[]

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '1400px',
          height: '90vh',
          backgroundColor: 'var(--bg-primary, #F2E8D8)',
          borderRadius: '32px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.4)',
          border: '1px solid var(--border, #D4C5B0)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '28px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border, #D4C5B0)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: 'rgba(139,94,60,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent, #8B5E3C)'
            }}>
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28, fontWeight: 800,
                color: 'var(--text-primary, #2C1F14)', margin: 0
              }}>
                Mis Favoritos
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary, #5F6F52)', margin: '2px 0 0' }}>
                {loading ? 'Cargando...' : `${favoriteIds.size} ${favoriteIds.size === 1 ? 'prenda guardada' : 'prendas guardadas'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              border: '1px solid var(--border, #D4C5B0)',
              backgroundColor: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            className="hover:scale-110 hover:shadow-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 48px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 360, borderRadius: 20, backgroundColor: 'var(--bg-card)', animation: 'pulse 2s infinite ease-in-out' }} />
              ))}
            </div>
          ) : favoritos.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 16
            }}>
              <div style={{ fontSize: 64 }}>💔</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                Tu lista de favoritos está vacía
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                Explora prendas y guarda tus favoritas aquí
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 8, padding: '12px 28px', borderRadius: 14, border: 'none',
                  backgroundColor: 'var(--accent, #8B5E3C)', color: 'white',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Explorar prendas
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {favoritos.map((product) => (
                <article
                  key={product.id_prenda}
                  style={{
                    backgroundColor: 'var(--bg-card, #FAF4EC)',
                    border: '1px solid var(--border, #D4C5B0)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    borderRadius: 20, overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  className="group hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div style={{
                    position: 'relative', overflow: 'hidden',
                    height: 200, backgroundColor: 'var(--bg-secondary, #EAD9C3)'
                  }}>
                    <Image
                      src={product.imagen_url}
                      alt={product.titulo}
                      width={400} height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Heart — removes from favorites via context → Supabase */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorito(product.id_prenda) }}
                      title="Quitar de favoritos"
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 34, height: 34, borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10,
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s', color: '#EC4899'
                      }}
                      className="hover:scale-110"
                    >
                      <Heart size={16} fill="#EC4899" />
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '16px 16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary, #2C1F14)', lineHeight: 1.3, margin: 0 }}
                        className="line-clamp-2">
                        {product.titulo}
                      </h3>
                      <span style={{
                        ...getConditionStyle(product.condicion),
                        fontSize: 10, fontWeight: 700, padding: '3px 8px',
                        borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0
                      }}>
                        {product.condicion}
                      </span>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent, #8B5E3C)', margin: '0 0 14px' }}>
                      ${product.precio.toLocaleString('es-CO')} COP
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          backgroundColor: 'var(--bg-secondary, #EAD9C3)',
                          color: 'var(--accent, #8B5E3C)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, flexShrink: 0
                        }}>
                          {product.vendedor.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', margin: 0 }}>{product.vendedor}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={10} fill="#F59E0B" color="#F59E0B" />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: 'var(--accent, #8B5E3C)', color: 'white',
                          border: 'none', borderRadius: 10, width: 34, height: 34,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        title="Añadir al carrito"
                        className="hover:scale-105"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 48px', display: 'flex', justifyContent: 'flex-end', gap: 12,
          borderTop: '1px solid var(--border, #D4C5B0)', flexShrink: 0
        }}>
          <button onClick={onClose} style={{
            padding: '12px 24px', borderRadius: 14,
            border: '1px solid var(--border, #D4C5B0)', backgroundColor: 'white',
            color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            Seguir explorando
          </button>
          <button style={{
            padding: '12px 28px', borderRadius: 14, border: 'none',
            backgroundColor: 'var(--accent, #8B5E3C)', color: 'white',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 16px -4px rgba(139,94,60,0.4)'
          }}>
            Ver Carrito
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(50px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
