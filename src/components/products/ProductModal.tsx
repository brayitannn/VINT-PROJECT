'use client'

import { useEffect, useState } from 'react'
import type { Product, ProductInsert, ProductUpdate, ProductStatus } from '@/types/product'

interface Props {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSubmit: (data: ProductInsert | ProductUpdate) => Promise<{ error: string | null }>
}

const EMPTY: ProductInsert = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  sku: '',
  category: '',
  status: 'draft',
  image_url: '',
}

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'draft', label: 'Borrador' },
]

export function ProductModal({ open, product, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ProductInsert>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const isEdit = !!product

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        stock: product.stock,
        sku: product.sku,
        category: product.category ?? '',
        status: product.status,
        image_url: product.image_url ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setFieldError(null)
  }, [product, open])

  const set = (key: keyof ProductInsert, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setFieldError('El nombre es requerido.')
    if (!form.sku.trim()) return setFieldError('El SKU es requerido.')
    if (form.price < 0) return setFieldError('El precio no puede ser negativo.')
    if (form.stock < 0) return setFieldError('El stock no puede ser negativo.')

    setSubmitting(true)
    setFieldError(null)

    const payload = {
      ...form,
      description: form.description || null,
      category: (form.category as string) || null,
      image_url: (form.image_url as string) || null,
    }

    const { error } = await onSubmit(payload)
    setSubmitting(false)
    if (error) setFieldError(error)
    else onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{isEdit ? 'Editar producto' : 'Nuevo producto'}</p>
            <h2 className="modal-title">{isEdit ? product!.name : 'Crear producto'}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Name */}
            <div className="field col-span-2">
              <label className="field-label">Nombre *</label>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Nombre del producto"
                required
              />
            </div>

            {/* SKU */}
            <div className="field">
              <label className="field-label">SKU *</label>
              <input
                className="field-input"
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="PROD-001"
                required
              />
            </div>

            {/* Status */}
            <div className="field">
              <label className="field-label">Estado</label>
              <select
                className="field-input"
                value={form.status}
                onChange={(e) => set('status', e.target.value as ProductStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="field">
              <label className="field-label">Precio *</label>
              <div className="field-prefix-wrapper">
                <span className="field-prefix">$</span>
                <input
                  className="field-input with-prefix"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Stock */}
            <div className="field">
              <label className="field-label">Stock</label>
              <input
                className="field-input"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set('stock', parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Category */}
            <div className="field col-span-2">
              <label className="field-label">Categoría</label>
              <input
                className="field-input"
                value={form.category as string}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Electrónica, Ropa, etc."
              />
            </div>

            {/* Image URL */}
            <div className="field col-span-2">
              <label className="field-label">URL de imagen</label>
              <input
                className="field-input"
                value={form.image_url as string}
                onChange={(e) => set('image_url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Description */}
            <div className="field col-span-2">
              <label className="field-label">Descripción</label>
              <textarea
                className="field-input field-textarea"
                value={form.description as string}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Descripción del producto..."
                rows={3}
              />
            </div>
          </div>

          {/* Error */}
          {fieldError && (
            <div className="form-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              {fieldError}
            </div>
          )}

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="btn-spinner" />
              ) : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}