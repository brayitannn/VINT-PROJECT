'use client'

import type { Product, ProductFilters } from '@/types/product'

interface Props {
  products: Product[]
  loading: boolean
  selected: Set<string>
  filters: ProductFilters
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onSort: (key: keyof Product) => void
  onViewProduct?: (product: Product) => void
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  published: { label: 'Publicado', className: 'badge-active' },
  draft: { label: 'Borrador', className: 'badge-draft' },
  archived: { label: 'Oculto', className: 'badge-inactive' },
  sold: { label: 'Vendida', className: 'badge-sold' },
}


function SortIcon({ field, filters }: { field: keyof Product; filters: ProductFilters }) {
  const active = filters.sortBy === field
  const asc = filters.sortOrder === 'asc'
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      className={`sort-icon ${active ? 'sort-active' : ''}`}
    >
      {active && asc ? (
        <path d="M12 5l7 7H5l7-7z" fill="currentColor" stroke="none" />
      ) : active && !asc ? (
        <path d="M12 19l7-7H5l7 7z" fill="currentColor" stroke="none" />
      ) : (
        <>
          <path d="M12 5l4 4H8l4-4z" />
          <path d="M12 19l4-4H8l4 4z" />
        </>
      )}
    </svg>
  )
}

export function ProductTable({
  products,
  loading,
  selected,
  filters,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onSort,
  onViewProduct,
}: Props) {
  const allSelected = products.length > 0 && selected.size === products.length
  const someSelected = selected.size > 0 && !allSelected

  const SortTh = ({ label, field }: { label: string; field: keyof Product }) => (
    <th className="th sortable" onClick={() => onSort(field)}>
      <span className="th-inner">
        {label}
        <SortIcon field={field} filters={filters} />
      </span>
    </th>
  )

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th className="th th-check">
              <input
                type="checkbox"
                className="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected }}
                onChange={onToggleSelectAll}
              />
            </th>
            <SortTh label="SKU" field="sku" />
            <SortTh label="Producto" field="name" />
            <SortTh label="Precio" field="price" />
            <SortTh label="Categoría" field="category" />
            <SortTh label="Stock" field="stock" />
            <SortTh label="Estado" field="status" />
            <th className="th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && products.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="tr-skeleton">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="td">
                    <div className="skeleton" />
                  </td>
                ))}
              </tr>
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={8} className="td-empty">
                <div className="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <p>No se encontraron productos</p>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const isSelected = selected.has(product.id)
              const status = STATUS_CONFIG[product.status] || STATUS_CONFIG.draft

              return (
                <tr
                  key={product.id}
                  className={`tr ${isSelected ? 'tr-selected' : ''}`}
                  onClick={() => onViewProduct?.(product)}
                  style={{ cursor: 'pointer' }}
                  title="Haz clic para ver el detalle en grande"
                >
                  <td className="td td-check" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id)}
                    />
                  </td>
                  <td className="td">
                    <code className="sku">{product.sku || 'N/A'}</code>
                  </td>
                  <td className="td">
                    <div className="product-cell">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="product-thumb" />
                      ) : (
                        <div className="product-thumb-placeholder">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="product-name">{product.name}</p>
                        {product.description && (
                          <p className="product-desc line-clamp-1 max-w-[150px]">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="td td-number">
                    ${product.price ? product.price.toLocaleString('es-CO', { minimumFractionDigits: 0 }) : 0}
                  </td>
                  <td className="td">
                    {product.category ? (
                      <span className="category-tag">{product.category}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="td">
                    <span style={{ fontSize: 13, fontWeight: product.stock === 0 ? 700 : 500, color: product.stock === 0 ? '#ef4444' : 'inherit' }}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="td">
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="td" onClick={(e) => e.stopPropagation()}>
                    <div className="action-group">
                      <button
                        className="action-btn action-edit"
                        onClick={() => onEdit(product)}
                        title="Editar"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn action-delete"
                        onClick={() => onDelete(product)}
                        title="Eliminar"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6m4-6v6" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}