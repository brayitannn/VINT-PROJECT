'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Product, ProductInsert, ProductUpdate, ProductStatus } from '@/types/product'
import { getSupabaseClient } from '@/lib/supabase/client'

interface Props {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSubmit: (data: ProductInsert | ProductUpdate) => Promise<{ error: string | null }>
  categories?: {id: string, nombre: string}[]
}

const EMPTY: ProductInsert = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  sku: "",
  category: "",
  category_id: 0,
  status: "draft",
  image_url: ""
};

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'published', label: 'Publicado (En Venta)' },
  { value: 'draft', label: 'Borrador' },
  { value: 'archived', label: 'Oculto / Pausada' },
  { value: 'sold', label: 'Vendida' },
]

export function ProductModal({ open, product, onClose, onSubmit, categories = [] }: Props) {
  const { user } = useAuth()
  const [form, setForm] = useState<any>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const isEdit = !!product

  useEffect(() => {
    if (product) {
      setForm({ 
        ...product,
        // Ensure the dropdown uses the ID for matching
        category: product.category_id?.toString() || product.category || ''
      })
    } else {
      setForm(EMPTY)
    }
    setFieldError(null)
  }, [product, open])

  const set = (key: keyof ProductInsert, value: string | number) =>
    setForm((f: any) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setFieldError('El nombre es requerido.')
    if (form.price < 0) return setFieldError('El precio no puede ser negativo.')
    if (form.stock < 0) return setFieldError('El stock no puede ser negativo.')

    setSubmitting(true)
    setFieldError(null)

    // Si estuviéramos insertando, agregaríamos el usuario id
    // Pero el submit lo maneja el padre
    const { error } = await onSubmit(form)
    
    setSubmitting(false)
    if (error) setFieldError(error)
    else onClose()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSubmitting(true)
    setFieldError(null)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `prendas/${user?.id ?? 'anon'}_${Date.now()}.${ext}`

      const supabase = getSupabaseClient()
      const { data, error: uploadError } = await supabase.storage
        .from('prendas')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('prendas')
        .getPublicUrl(data.path)

      set('image_url', publicUrl)
    } catch (err: any) {
      setFieldError('Error al subir imagen: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</p>
            <h2 className="modal-title">{isEdit ? product!.name : 'Añadir Producto'}</h2>
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
            {/* Title */}
            <div className="field col-span-2">
              <label className="field-label">Nombre del Producto *</label>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ej. Camiseta Nike Vintage"
                required
              />
            </div>

            {/* Price & Stock */}
            <div className="field">
              <label className="field-label">Precio *</label>
              <div className="field-prefix-wrapper">
                <span className="field-prefix">$</span>
                <input
                  className="field-input with-prefix"
                  type="number"
                  min="0"
                  step="100"
                  value={form.price}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Stock *</label>
              <input
                className="field-input"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => set('stock', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            {/* SKU & Status */}
            <div className="field">
              <label className="field-label">SKU</label>
              <input
                className="field-input"
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="field">
              <label className="field-label">Estado de Publicación</label>
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

            {/* Category */}
            <div className="field col-span-2">
              <label className="field-label">Categoría</label>
              <select
                className="field-input"
                value={form.category || ''}
                onChange={(e) => set('category', e.target.value)}
              >
                <option value="">Selecciona o deja en blanco</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            {/* Image Selection */}
            <div className="field col-span-2">
              <label className="field-label">Imagen principal</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label 
                  htmlFor="imagen-upload"
                  style={{ 
                    width: 120, height: 120, border: '2px dashed var(--border)', 
                    borderRadius: 12, overflow: 'hidden', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)',
                    cursor: 'pointer', flexShrink: 0
                  }}
                  title="Toca para subir foto"
                >
                  {form.image_url ? (
                    <img src={form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, color: 'var(--text-muted)' }}>+</span>
                  )}
                </label>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    id="imagen-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button"
                    onClick={() => document.getElementById('imagen-upload')?.click()}
                    style={{
                      background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)',
                      borderRadius: 6, padding: '4px 10px', fontSize: 13, cursor: 'pointer',
                      fontWeight: 600, width: 'fit-content'
                    }}
                  >
                    Buscar archivo
                  </button>

                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    O pega una URL directa:
                  </p>
                  <input
                    className="field-input"
                    value={(form.image_url as string) || ''}
                    onChange={(e) => set('image_url', e.target.value)}
                    placeholder="https://misitio.com/imagen.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="field col-span-2">
              <label className="field-label">Descripción</label>
              <textarea
                className="field-input field-textarea"
                value={form.description || ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe el producto..."
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