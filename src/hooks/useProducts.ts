import { useState, useCallback, useEffect } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProducts,
  getCategories,
} from '@/services/products'
import type {
  Product,
  ProductInsert,
  ProductUpdate,
  ProductFilters,
  PaginationState,
} from '@/types/product'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{id: string, nombre: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    status: 'all',
    category: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  })

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, count, error } = await getProducts(
      filters,
      pagination.page,
      pagination.pageSize
    )
    if (error) setError(error)
    else {
      setProducts(data)
      setPagination((p) => ({ ...p, total: count }))
    }
    setLoading(false)
  }, [filters, pagination.page, pagination.pageSize])

  useEffect(() => {
    fetchProducts()

    const handleSync = () => {
      fetchProducts()
    }

    window.addEventListener('vint:pedido-cancelado', handleSync)
    window.addEventListener('vint:producto-actualizado', handleSync)

    return () => {
      window.removeEventListener('vint:pedido-cancelado', handleSync)
      window.removeEventListener('vint:producto-actualizado', handleSync)
    }
  }, [fetchProducts])

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  // ── Filters ────────────────────────────────────────────────────────────────
  const updateFilters = useCallback((next: Partial<ProductFilters>) => {
    setFilters((f) => ({ ...f, ...next }))
    setPagination((p) => ({ ...p, page: 1 }))
  }, [])

  // ── Create ─────────────────────────────────────────────────────────────────
  const create = useCallback(
    async (payload: ProductInsert): Promise<{ error: string | null }> => {
      setLoading(true)
      const { error } = await createProduct(payload)
      setLoading(false)
      if (!error) await fetchProducts()
      return { error }
    },
    [fetchProducts]
  )

  // ── Update ─────────────────────────────────────────────────────────────────
  const update = useCallback(
    async (id: string, payload: ProductUpdate): Promise<{ error: string | null }> => {
      setLoading(true)
      const { error } = await updateProduct(id, payload)
      setLoading(false)
      if (!error){ 
        await new Promise(resolve => setTimeout(resolve, 500))
        await fetchProducts()
      }
      return { error }
    },
    [fetchProducts]
  )

  // ── Delete single ──────────────────────────────────────────────────────────
  const remove = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      setLoading(true)
      const { error } = await deleteProduct(id)
      setLoading(false)
      if (!error) {
        setSelected((s) => { s.delete(id); return new Set(s) })
        await fetchProducts()
      }
      return { error }
    },
    [fetchProducts]
  )

  // ── Bulk delete ────────────────────────────────────────────────────────────
  const removeSelected = useCallback(async (): Promise<{ error: string | null }> => {
    const ids = [...selected]
    if (!ids.length) return { error: null }
    setLoading(true)
    const { error } = await deleteProducts(ids)
    setLoading(false)
    if (!error) {
      setSelected(new Set())
      await fetchProducts()
    }
    return { error }
  }, [selected, fetchProducts])

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelected((s) => {
      const next = new Set(s)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelected((s) =>
      s.size === products.length ? new Set() : new Set(products.map((p) => p.id))
    )
  }, [products])

  // ── Pagination ─────────────────────────────────────────────────────────────
  const goToPage = useCallback((page: number) => {
    setPagination((p) => ({ ...p, page }))
  }, [])

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  return {
    products,
    categories,
    loading,
    error,
    filters,
    pagination,
    totalPages,
    selected,
    fetchProducts,
    updateFilters,
    create,
    update,
    remove,
    removeSelected,
    toggleSelect,
    toggleSelectAll,
    goToPage,
  }
}