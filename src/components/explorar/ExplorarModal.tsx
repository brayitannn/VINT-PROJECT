'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, LayoutGrid, List, ArrowUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard, type Product } from '@/components/products/ProductCard'
import { FilterSidebar, type Filters } from '@/components/explorar/FilterSidebar'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'

type SortOption = 'reciente' | 'precio_asc' | 'precio_desc'

function ProductSkeleton() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden', animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 200, backgroundColor: 'var(--bg-secondary)' }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 14, backgroundColor: 'var(--bg-secondary)', borderRadius: 6, width: '70%' }} />
        <div style={{ height: 18, backgroundColor: 'var(--bg-secondary)', borderRadius: 6, width: '40%' }} />
        <div style={{ height: 12, backgroundColor: 'var(--bg-secondary)', borderRadius: 6, width: '55%' }} />
      </div>
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div style={{
      gridColumn: '1 / -1', textAlign: 'center',
      padding: '80px 20px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
      }}>🪣</div>
      <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
        {query ? `Sin resultados para "${query}"` : 'No hay prendas con estos filtros'}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 320 }}>
        Intenta con otros términos o ajusta los filtros para encontrar lo que buscas.
      </p>
    </div>
  )
}

interface ExplorarModalProps {
  open: boolean
  onClose: () => void
}

export function ExplorarModal({ open, onClose }: ExplorarModalProps) {
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [filters, setFilters] = useState<Filters>({
    search: '',
    priceMin: 0,
    priceMax: 300000,
    categorias: [],
    tallas: [],
    condiciones: [],
    genero: 'Todos',
  })

  const [sort, setSort] = useState<SortOption>('reciente')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const fetchProducts = useCallback(async (f: Filters, s: SortOption) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_catalogo_publico')
      if (error) throw error

      let filtered = (data ?? []) as any[]

      if (f.search) {
        const q = f.search.toLowerCase()
        filtered = filtered.filter(item =>
          item.titulo?.toLowerCase().includes(q) ||
          item.marca?.toLowerCase().includes(q) ||
          item.categoria?.toLowerCase().includes(q)
        )
      }
      if (f.categorias.length > 0) filtered = filtered.filter(item => f.categorias.includes(item.categoria))
      if (f.tallas.length > 0) filtered = filtered.filter(item => f.tallas.includes(item.talla))
      if (f.condiciones.length > 0) filtered = filtered.filter(item => f.condiciones.includes(item.condicion))
      if (f.genero !== 'Todos') filtered = filtered.filter(item => item.genero === f.genero)
      filtered = filtered.filter(item =>
        Number(item.precio) >= f.priceMin && Number(item.precio) <= f.priceMax
      )

      if (s === 'precio_asc') filtered.sort((a, b) => Number(a.precio) - Number(b.precio))
      else if (s === 'precio_desc') filtered.sort((a, b) => Number(b.precio) - Number(a.precio))
      else filtered.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime())

      filtered = filtered.slice(0, 48)

      const mapped: Product[] = filtered.map((item: any) => ({
        id: item.id_prenda,
        name: item.titulo,
        price: Number(item.precio),
        size: item.talla ?? 'Única',
        condition: item.condicion ?? 'Bueno',
        seller: item.vendedor ?? 'Vint Shop',
        image: item.imagen_principal ?? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop',
        rating: 5.0,
      }))

      setProducts(mapped)
    } catch (err) {
      console.error('Error fetching products:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProducts(filters, sort)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [filters, sort, fetchProducts, open])

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleSearchInput = (val: string) => {
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters(f => ({ ...f, search: val }))
    }, 400)
  }

  const activeFilterCount =
    filters.categorias.length + filters.tallas.length + filters.condiciones.length +
    (filters.genero !== 'Todos' ? 1 : 0) +
    (filters.priceMax < 300000 ? 1 : 0)

  if (!open) return null

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .product-item { animation: fadeInUp 0.3s ease forwards; }
        .sort-select:focus { outline: none; }
        .explorar-search-bar:focus-within {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .view-btn:hover { background-color: var(--bg-secondary) !important; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: '24px', zIndex: 1001,
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 24, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        animation: 'modalIn 0.25s ease',
      }}>

        {/* Header del modal */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', margin: 0 }}>
            Explorar prendas
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              backgroundColor: 'var(--bg-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

            {/* Sidebar */}
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              totalResults={products.length}
            />

            {/* Contenido */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Search Bar */}
              <div
                className="explorar-search-bar"
                style={{
                  marginBottom: 24,
                  display: 'flex', alignItems: 'center', gap: 12,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16, padding: '12px 20px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px var(--shadow-sm)',
                }}
              >
                <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  value={searchInput}
                  onChange={e => handleSearchInput(e.target.value)}
                  placeholder="Buscar por título, marca, categoría..."
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: 15, color: 'var(--text-primary)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                {searchInput && (
                  <button
                    onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: '' })) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, gap: 12, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{loading ? '...' : products.length}</strong> productos encontrados
                  </span>
                  {activeFilterCount > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, backgroundColor: 'var(--accent)',
                      color: 'white', padding: '2px 8px', borderRadius: 999,
                    }}>
                      {activeFilterCount} filtros activos
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '7px 12px',
                  }}>
                    <ArrowUpDown size={13} style={{ color: 'var(--text-muted)' }} />
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as SortOption)}
                      className="sort-select"
                      style={{
                        background: 'none', border: 'none', fontSize: 13,
                        color: 'var(--text-primary)', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <option value="reciente">Más recientes</option>
                      <option value="precio_asc">Menor precio</option>
                      <option value="precio_desc">Mayor precio</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'flex', gap: 2,
                    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 3,
                  }}>
                    {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
                      <button
                        key={mode}
                        className="view-btn"
                        onClick={() => setViewMode(mode)}
                        style={{
                          width: 30, height: 30, borderRadius: 7, border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                          backgroundColor: viewMode === mode ? 'var(--accent)' : 'transparent',
                          color: viewMode === mode ? 'white' : 'var(--text-muted)',
                        }}
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter chips */}
              {activeFilterCount > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {filters.categorias.map(c => (
                    <span key={c} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      backgroundColor: 'var(--accent-light)', color: 'var(--accent)',
                      border: '1px solid var(--accent)', borderRadius: 999,
                      fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    }}>
                      {c}
                      <X size={10} style={{ cursor: 'pointer' }}
                        onClick={() => setFilters(f => ({ ...f, categorias: f.categorias.filter(x => x !== c) }))} />
                    </span>
                  ))}
                  {filters.tallas.map(t => (
                    <span key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      backgroundColor: 'var(--accent-light)', color: 'var(--accent)',
                      border: '1px solid var(--accent)', borderRadius: 999,
                      fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    }}>
                      Talla {t}
                      <X size={10} style={{ cursor: 'pointer' }}
                        onClick={() => setFilters(f => ({ ...f, tallas: f.tallas.filter(x => x !== t) }))} />
                    </span>
                  ))}
                  {filters.condiciones.map(c => (
                    <span key={c} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      backgroundColor: 'var(--accent-light)', color: 'var(--accent)',
                      border: '1px solid var(--accent)', borderRadius: 999,
                      fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    }}>
                      {c}
                      <X size={10} style={{ cursor: 'pointer' }}
                        onClick={() => setFilters(f => ({ ...f, condiciones: f.condiciones.filter(x => x !== c) }))} />
                    </span>
                  ))}
                </div>
              )}

              {/* Grid */}
              <ul style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid'
                  ? 'repeat(auto-fill, minmax(220px, 1fr))'
                  : '1fr',
                gap: 20, listStyle: 'none', padding: 0, margin: 0,
              }}>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <li key={i}><ProductSkeleton /></li>
                    ))
                  : products.length === 0
                  ? <EmptyState query={filters.search} />
                  : products.map((p, i) => (
                      <li key={p.id} className="product-item" style={{ opacity: 0, animationDelay: `${i * 0.04}s` }}>
                        <ProductCard product={p} onOpen={setSelectedProduct} />
                      </li>
                    ))
                }
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}