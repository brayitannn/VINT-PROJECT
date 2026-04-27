'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { useFavorites } from '@/context/FavoritesContext'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/components/products/ProductCard'

// Usamos la misma lógica de mapeo que en ExplorarClient para garantizar consistencia
function mapCondicion(condicion: string): Product['condition'] {
  switch (condicion?.toUpperCase()) {
    case 'NUEVO':
    case 'COMO_NUEVO': return 'Excelente'
    case 'USADO': return 'Muy Bueno'
    case 'DESGASTADO': return 'Bueno'
    default: return 'Bueno'
  }
}

export function FavoritosClient() {
  const [mounted, setMounted] = useState(false)
  const [favoritos, setFavoritos] = useState<Product[]>([])
  const [fetchingProducts, setFetchingProducts] = useState(false)
  const { favoriteIds, toggleFavorito, loading } = useFavorites()
  const { addItem, isInCart } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (loading) return

    if (favoriteIds.size === 0) {
      setFavoritos([])
      return
    }

    const ids = Array.from(favoriteIds).filter(id => !isNaN(Number(id)))

    if (ids.length === 0) {
      setFavoritos([])
      return
    }

    setFetchingProducts(true)

    const fetchData = async () => {
      try {
        const supabase = createClient()
        // IMPORTANTE: Usamos v_catalogo_publico igual que en el explorador funcional
        const { data, error } = await supabase
          .from('v_catalogo_publico')
          .select('id_prenda, titulo, precio, imagen_principal, talla, condicion, vendedor')
          .in('id_prenda', ids)

        if (error) throw error

        const mapped: Product[] = (data ?? []).map((item: any) => ({
          id: String(item.id_prenda),
          name: item.titulo ?? 'Sin título',
          price: Number(item.precio),
          size: item.talla ?? 'M',
          condition: mapCondicion(item.condicion),
          seller: item.vendedor ?? 'Vendedor',
          image: item.imagen_principal ?? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop',
          rating: 4.5
        }))
        setFavoritos(mapped)
      } catch (error: any) {
        console.error('[FavoritosClient] Error al cargar productos:', error.message)
        setFavoritos([])
      } finally {
        setFetchingProducts(false)
      }
    }

    fetchData()
  }, [favoriteIds, loading])

  if (!mounted) return null

  const isLoadingAll = loading || fetchingProducts

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 2rem' }}>
      {isLoadingAll ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 360, borderRadius: 20, backgroundColor: 'var(--bg-card)', animation: 'pulse 2s infinite ease-in-out' }} />
          ))}
        </div>
      ) : favoritos.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '50vh', gap: 16
        }}>
          <div style={{ fontSize: 64 }}>💔</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            Tu lista de favoritos está vacía
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            Explora prendas y guarda tus favoritas aquí
          </p>
          <a
            href="/explorar"
            style={{
              marginTop: 8, padding: '12px 28px', borderRadius: 14, textDecoration: 'none',
              backgroundColor: 'var(--accent, #8B5E3C)', color: 'white',
              fontSize: 15, fontWeight: 600
            }}
          >
            Explorar prendas
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {favoritos.map((product) => {
            const inCart = isInCart(product.id)
            return (
              <article
                key={product.id}
                style={{
                  backgroundColor: 'var(--bg-card, #FAF4EC)',
                  border: '1px solid var(--border, #D4C5B0)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderRadius: 20, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                  position: 'relative'
                }}
                className="group hover:-translate-y-1 hover:shadow-lg"
              >
                <div style={{
                  position: 'relative', overflow: 'hidden',
                  height: 230, backgroundColor: 'var(--bg-secondary, #EAD9C3)'
                }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400} height={230}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFavorito(String(product.id)) }}
                    style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 36, height: 36, borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#EC4899'
                    }}
                    className="hover:scale-110"
                  >
                    <Heart size={18} fill="#EC4899" />
                  </button>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary, #2C1F14)', lineHeight: 1.3, margin: 0 }}
                      className="line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                    Talla: <strong>{product.size}</strong> · {product.condition}
                  </p>

                  <p style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent, #8B5E3C)', margin: '0 0 16px' }}>
                    ${product.price.toLocaleString('es-CO')} COP
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                        {product.seller}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        addItem(product)
                      }}
                      style={{
                        backgroundColor: inCart ? '#10B981' : 'var(--accent, #8B5E3C)',
                        color: 'white', border: 'none', borderRadius: 12, width: 36, height: 36,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      title={inCart ? 'Ya en el carrito' : 'Añadir al carrito'}
                      className="hover:scale-105"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
