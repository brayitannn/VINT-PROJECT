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
}

const STATUS_CONFIG = {
  DISPONIBLE: { label: 'Disponible', className: 'badge-active' },
  OCULTO: { label: 'Oculto', className: 'badge-draft' },
  VENDIDO: { label: 'Vendido', className: 'badge-inactive' },
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
            <SortTh label="ID (Cat)" field="id_categoria" />
            <SortTh label="Prenda" field="titulo" />
            <SortTh label="Precio" field="precio" />
            <SortTh label="Talla" field="talla" />
            <SortTh label="Color" field="color" />
            <SortTh label="Género" field="genero" />
            <SortTh label="Estado" field="estado_publicacion" />
            <th className="th">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading && products.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="tr-skeleton">
                {Array.from({ length: 9 }).map((_, j) => (
                  <td key={j} className="td">
                    <div className="skeleton" />
                  </td>
                ))}
              </tr>
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={9} className="td-empty">
                <div className="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <p>No se encontraron prendas</p>
                </div>
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const isSelected = selected.has(product.id_prenda)
              const status = STATUS_CONFIG[product.estado_publicacion] || STATUS_CONFIG.OCULTO

              return (
                <tr key={product.id_prenda} className={`tr ${isSelected ? 'tr-selected' : ''}`}>
                  <td className="td td-check">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(product.id_prenda)}
                    />
                  </td>
                  <td className="td">
                    <code className="sku">CAT-{product.id_categoria}</code>
                  </td>
                  <td className="td">
                    <div className="product-cell">
                      {product.imagen_url ? (
                        <img src={product.imagen_url} alt={product.titulo} className="product-thumb" />
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
                        <p className="product-name">{product.titulo}</p>
                        {product.descripcion && (
                          <p className="product-desc line-clamp-1 max-w-[150px]">{product.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="td td-number">
                    ${product.precio.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="td">
                    {product.talla ? (
                      <span className="category-tag">{product.talla}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="td">
                    <span style={{ fontSize: 13 }}>{product.color || '—'}</span>
                  </td>
                  <td className="td">
                    <span style={{ fontSize: 13 }}>{product.genero || '—'}</span>
                  </td>
                  <td className="td">
                    <span className={`badge ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="td">
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