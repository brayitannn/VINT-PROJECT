'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductModal } from '@/components/products/ProductModal'
import { ProductDeleteDialog } from '@/components/products/ProductDeleteDialog'
import type { Product, ProductInsert, ProductUpdate, ProductStatus } from '@/types/product'
import './products.css'

// 1. Creamos un componente interno con toda tu lógica actual
function ProductsContent() {
  const {
    products,
    categories,
    loading,
    error,
    filters,
    pagination,
    totalPages,
    selected,
    updateFilters,
    create,
    update,
    remove,
    removeSelected,
    toggleSelect,
    toggleSelectAll,
    goToPage,
  } = useProducts()

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Redirección de autenticación
  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [deletingBulk, setDeletingBulk] = useState(false)

  // Auto-open modal if ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setEditingProduct(null)
      setModalOpen(true)
    }
  }, [searchParams])

  // Handlers
  const openCreate = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const openDelete = (product: Product) => {
    setDeletingProduct(product)
    setDeletingBulk(false)
    setDeleteOpen(true)
  }

  const openBulkDelete = () => {
    setDeletingProduct(null)
    setDeletingBulk(true)
    setDeleteOpen(true)
  }

  const handleModalSubmit = async (data: ProductInsert | ProductUpdate) => {
    if (editingProduct) {
      return update(editingProduct.id, data as ProductUpdate)
    }
    return create(data as ProductInsert)
  }

  const handleDeleteConfirm = async () => {
    if (deletingBulk) return removeSelected()
    if (deletingProduct) return remove(deletingProduct.id)
    return { error: null }
  }

  const handleSort = (key: keyof Product) => {
    if (filters.sortBy === key) {
      updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      updateFilters({ sortBy: key, sortOrder: 'asc' })
    }
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  if (authLoading) return null

  return (
    <div className="page" style={{ position: 'relative' }}>
      <div style={{ marginBottom: 24, display: 'flex' }}>
        <Link 
          href="/dashboard" 
          className="hover:scale-105"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: '999px',
            backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
            border: '1px solid var(--border)', transition: 'all 0.2s',
          }}
        >
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">
            {pagination.total} producto{pagination.total !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo producto
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="search-input"
            placeholder="Buscar por nombre, SKU o descripción…"
            value={filters.search ?? ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
          {filters.search && (
            <button className="search-clear" onClick={() => updateFilters({ search: '' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="toolbar-right">
          <select
            className="filter-select"
            value={filters.status ?? 'all'}
            onChange={(e) => updateFilters({ status: e.target.value as ProductStatus | 'all' })}
          >
            <option value="all">Todos los estados</option>
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
            <option value="archived">Oculto</option>
          </select>

          {categories.length > 0 && (
            <select
              className="filter-select"
              value={filters.category ?? 'all'}
              onChange={(e) => updateFilters({ category: e.target.value === 'all' ? 'all' : e.target.value })}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}

          {selected.size > 0 && (
            <button className="btn btn-danger-outline" onClick={openBulkDelete}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
              Eliminar {selected.size}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </div>
      )}

      <ProductTable
        products={products}
        loading={loading}
        selected={selected}
        filters={filters}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onEdit={openEdit}
        onDelete={openDelete}
        onSort={handleSort}
      />

      {totalPages > 1 && (
        <div className="pagination">
          <p className="pagination-info">
            Mostrando {(pagination.page - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
          </p>
          <div className="pagination-controls">
            <button className="page-btn" disabled={pagination.page === 1} onClick={() => goToPage(pagination.page - 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                className={`page-btn ${n === pagination.page ? 'page-btn-active' : ''}`}
                onClick={() => goToPage(n)}
              >
                {n}
              </button>
            ))}
            <button className="page-btn" disabled={pagination.page === totalPages} onClick={() => goToPage(pagination.page + 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <ProductModal
        open={modalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ProductDeleteDialog
        open={deleteOpen}
        productName={deletingProduct?.name}
        count={deletingBulk ? selected.size : undefined}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

// 2. Export predeterminado envuelto en Suspense para evitar el error de Build
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page">Cargando inventario...</div>}>
      <ProductsContent />
    </Suspense>
  )
}