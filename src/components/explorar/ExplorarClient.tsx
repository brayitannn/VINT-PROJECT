'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, LayoutGrid, List, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard, type Product } from '@/components/products/ProductCard'
import { FilterSidebar, type Filters } from '@/components/explorar/FilterSidebar'
import { ProductDetailModal } from '@/components/products/ProductDetailModal'
import { useTracker } from '@/hooks/useTracker'

type SortOption = 'reciente' | 'precio_asc' | 'precio_desc'

function mapCondicion(condicion: string): Product['condition'] {
  switch (condicion?.toUpperCase()) {
    case 'NUEVO':
    case 'COMO_NUEVO': return 'Excelente'
    case 'USADO': return 'Muy Bueno'
    case 'DESGASTADO': return 'Bueno'
    default: return 'Bueno'
  }
}

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

export function ExplorarClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('q') ?? '',
    priceMin: 0,
    priceMax: 300000,
    categorias: searchParams.get('categoria') ? [searchParams.get('categoria')!] : [],
    tallas: searchParams.get('talla') ? [searchParams.get('talla')!] : [],
    condiciones: [],
    genero: 'Todos',
  })

  const [sort, setSort] = useState<SortOption>('reciente')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState(filters.search)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { track, trackVistaDebounced, cancelTrackVista } = useTracker()

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = searchParams.get('page')
    return p ? parseInt(p, 10) : 1
  })
  const [totalCount, setTotalCount] = useState<number>(0)
  const mountedRef = useRef(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const ITEMS_PER_PAGE = 15

  // Sync URL with filters and page
  const syncURL = useCallback((f: Filters, s: SortOption, page: number) => {
    const params = new URLSearchParams()
    if (f.search) params.set('q', f.search)
    if (f.categorias.length === 1) params.set('categoria', f.categorias[0])
    if (f.tallas.length === 1) params.set('talla', f.tallas[0])
    if (s !== 'reciente') params.set('orden', s)
    if (page > 1) params.set('page', String(page))
    router.replace(`/explorar?${params.toString()}`, { scroll: false })
  }, [router])

  const fetchProducts = useCallback(async (f: Filters, s: SortOption, page: number) => {
    setLoading(true)
    try {
      let query = supabase.from('v_catalogo_publico').select('*', { count: 'exact' })

      if (f.search) {
        query = query.ilike('titulo', `%${f.search}%`)
      }
      if (f.categorias.length > 0) {
        query = query.in('categoria', f.categorias)
      }
      if (f.tallas.length > 0) {
        query = query.in('talla', f.tallas)
      }
      if (f.condiciones.length > 0) {
        const dbCondiciones = f.condiciones.flatMap(c => {
          if (c === 'Excelente') return ['NUEVO', 'COMO_NUEVO']
          if (c === 'Muy Bueno') return ['USADO']
          if (c === 'Bueno') return ['DESGASTADO']
          return []
        })
        query = query.in('condicion', dbCondiciones)
      }
      if (f.genero !== 'Todos') {
        query = query.ilike('genero', f.genero)
      }
      query = query.gte('precio', f.priceMin).lte('precio', f.priceMax)

      if (s === 'precio_asc') query = query.order('precio', { ascending: true })
      else if (s === 'precio_desc') query = query.order('precio', { ascending: false })
      else query = query.order('fecha_publicacion', { ascending: false })

      // Range is zero-indexed and inclusive
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) throw error

      const mapped: Product[] = (data ?? []).map((item: any) => ({
        id: item.id_prenda,
        name: item.titulo,
        price: Number(item.precio),
        size: item.talla ?? 'M',
        condition: mapCondicion(item.condicion),
        seller: item.vendedor ?? 'Vendedor',
        image: item.imagen_principal ?? 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=500&fit=crop',
        rating: 4.5,
      }))
      setProducts(mapped)
      setTotalCount(count ?? 0)
    } catch (err) {
      console.error('Error fetching products:', err)
      setProducts([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Reset page to 1 when filters or sort change
  const lastFiltersRef = useRef(filters)
  const lastSortRef = useRef(sort)

  useEffect(() => {
    if (lastFiltersRef.current !== filters || lastSortRef.current !== sort) {
      lastFiltersRef.current = filters
      lastSortRef.current = sort
      setCurrentPage(1)
    }
  }, [filters, sort])

  // Sync URL searchParams to currentPage
  useEffect(() => {
    const p = searchParams.get('page')
    const pageVal = p ? parseInt(p, 10) : 1
    setCurrentPage(pageVal)
  }, [searchParams])

  // Debounced fetch on filter or page change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProducts(filters, sort, currentPage)
      syncURL(filters, sort, currentPage)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [filters, sort, currentPage, fetchProducts, syncURL])

  // Scroll to top when page changes
  useEffect(() => {
    if (mountedRef.current) {
      if (contentRef.current) {
        const topPos = contentRef.current.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: topPos, behavior: 'smooth' })
      }
    } else {
      mountedRef.current = true
    }
  }, [currentPage])

  // Debounced search input
  const handleSearchInput = (val: string) => {
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters(f => ({ ...f, search: val }))
      // Registrar búsqueda si hay texto
      if (val.trim().length > 2) {
        track('busqueda', { termino: val.trim() })
      }
    }, 400)
  }

  const activeFilterCount =
    filters.categorias.length + filters.tallas.length + filters.condiciones.length +
    (filters.genero !== 'Todos' ? 1 : 0) +
    (filters.priceMax < 300000 ? 1 : 0)

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
        .product-item {
          animation: fadeInUp 0.3s ease forwards;
        }
        .product-item:nth-child(1) { animation-delay: 0.03s; }
        .product-item:nth-child(2) { animation-delay: 0.06s; }
        .product-item:nth-child(3) { animation-delay: 0.09s; }
        .product-item:nth-child(4) { animation-delay: 0.12s; }
        .product-item:nth-child(5) { animation-delay: 0.15s; }
        .product-item:nth-child(6) { animation-delay: 0.18s; }
        .sort-select:focus { outline: none; }
        .search-bar:focus-within {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .view-btn:hover { background-color: var(--bg-secondary) !important; }
        .pag-btn:not(:disabled):hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent) !important;
          transform: translateY(-2px);
        }
        .pag-btn.active:hover {
          background-color: var(--accent) !important;
          color: var(--bg-primary) !important;
          transform: none;
        }
      `}</style>

      {/* Main layout */}
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '32px 2rem', display: 'flex', gap: 28, alignItems: 'flex-start',
      }}>
        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          totalResults={totalCount}
        />

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0 }}>
          
          {/* Aesthetic Integrated Search Bar */}
          <div
            className="search-bar"
            style={{
              marginBottom: 32,
              display: 'flex', alignItems: 'center', gap: 12,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16, padding: '12px 20px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px var(--shadow-sm)'
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
            marginBottom: 24, gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {loading ? (
                  'Buscando productos...'
                ) : totalCount === 0 ? (
                  'No se encontraron productos'
                ) : (
                  <>
                    Mostrando <strong style={{ color: 'var(--text-primary)' }}>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong> productos
                  </>
                )}
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
              {/* Sort */}
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

              {/* View toggle */}
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

          {/* Active filter chips */}
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
              ? 'repeat(auto-fill, minmax(240px, 1fr))'
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
                    <div
                      onMouseEnter={() => trackVistaDebounced(String(p.id), undefined, 2000)}
                      onMouseLeave={() => cancelTrackVista(String(p.id))}
                    >
                      <ProductCard product={p} onOpen={setSelectedProduct} />
                    </div>
                  </li>
                ))
            }
          </ul>

          {/* Paginación */}
          {!loading && totalCount > ITEMS_PER_PAGE && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 40,
              flexWrap: 'wrap',
            }}>
              {/* Botón Anterior */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pag-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Números de Página */}
              {(() => {
                const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
                const pages: (number | string)[] = []
                const maxVisiblePages = 5
                
                if (totalPages <= maxVisiblePages) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i)
                } else {
                  pages.push(1)
                  let start = Math.max(2, currentPage - 1)
                  let end = Math.min(totalPages - 1, currentPage + 1)
                  if (currentPage <= 3) {
                    end = 4
                  } else if (currentPage >= totalPages - 2) {
                    start = totalPages - 3
                  }
                  if (start > 2) pages.push('...')
                  for (let i = start; i <= end; i++) pages.push(i)
                  if (end < totalPages - 1) pages.push('...')
                  pages.push(totalPages)
                }

                return pages.map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`dots-${idx}`}
                        style={{
                          padding: '0 8px',
                          color: 'var(--text-muted)',
                          fontSize: 14,
                          userSelect: 'none',
                        }}
                      >
                        ...
                      </span>
                    )
                  }

                  const isActive = page === currentPage
                  return (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(Number(page))}
                      className={`pag-btn ${isActive ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                        color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {page}
                    </button>
                  )
                })
              })()}

              {/* Botón Siguiente */}
              <button
                onClick={() => {
                  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                }}
                disabled={currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE)}
                className="pag-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE) ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: currentPage === Math.ceil(totalCount / ITEMS_PER_PAGE) ? 0.5 : 1,
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product detail modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  )
}
