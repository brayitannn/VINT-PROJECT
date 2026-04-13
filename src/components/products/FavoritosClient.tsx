'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { useFavorites } from '@/components/layout/FavoritesContext'
import { useCart } from '@/components/layout/CartContext'
import { createClient } from '@/lib/supabase/client'

interface ProductoFavorito {
  id: string
  name: string
  price: number
  image_url: string
  category?: string
  stock: number
}

export function FavoritosClient() {
  const [mounted, setMounted] = useState(false)
  const [favoritos, setFavoritos] = useState<ProductoFavorito[]>([])
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

    const ids = Array.from(favoriteIds)
    setFetchingProducts(true)

    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, category, stock')
          .in('id', ids)

        if (error) throw error

        const mapped: ProductoFavorito[] = (data ?? []).map((item: any) => ({
          id: item.id,
          name: item.name ?? 'Sin título',
          price: Number(item.price),
          image_url: item.image_url ?? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop',
          category: item.category,
          stock: item.stock,
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
            const inCart = isInCart(product.id as unknown as number)
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
                }}
                className="group hover:-translate-y-1 hover:shadow-lg"
              >
                <div style={{
                  position: 'relative', overflow: 'hidden',
                  height: 230, backgroundColor: 'var(--bg-secondary, #EAD9C3)'
                }}>
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={400} height={230}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFavorito(product.id.toString()) }}
                    title="Quitar de favoritos"
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

                  {product.category && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                      Cat: <strong>{product.category}</strong>
                    </p>
                  )}

                  <p style={{ fontWeight: 800, fontSize: 20, color: 'var(--accent, #8B5E3C)', margin: '0 0 16px' }}>
                    ${product.price.toLocaleString('es-CO')} COP
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontSize: 12, fontWeight: product.stock === 0 ? 700 : 500, color: product.stock === 0 ? '#ef4444' : 'var(--text-secondary)', margin: 0 }}>
                        Stock: {product.stock}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        addItem({
                          id: product.id as unknown as number,
                          name: product.name,
                          price: product.price,
                          size: 'Única',
                          condition: 'Bueno',
                          seller: 'Vint',
                          image: product.image_url,
                          rating: 5,
                        })
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
    </div>
  )
}
