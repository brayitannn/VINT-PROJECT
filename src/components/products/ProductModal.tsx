'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Product, ProductInsert, ProductUpdate, ProductStatus } from '@/types/product'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getCategories, getMarcas } from '@/services/products'

interface Props {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSubmit: (data: ProductInsert | ProductUpdate) => Promise<{ error: string | null }>
  categories?: { id: string; nombre: string }[]
  marcas?: { id_marca: string; nombre: string }[]
}

const EMPTY: ProductInsert = {
  name: "",
  description: "",
  price: 0,
  stock: 1,
  category: "1",
  category_id: 1,
  id_marca: 1,
  brand: "Sin marca",
  status: "published",
  image_url: "",
  size: "M",
  color: "Combinado",
  gender: "Unisex",
  condition: "USADO",
}

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'published', label: 'Publicado (En Venta)' },
  { value: 'archived', label: 'Oculto / Pausada' },
  { value: 'sold', label: 'Vendida' },
  { value: 'draft', label: 'Borrador' },
]

const CONDICIONES_OPTIONS = [
  { value: 'USADO', label: 'Usado (Buen estado)' },
  { value: 'NUEVO', label: 'Nuevo (Con o sin etiqueta)' },
]

const GENEROS_OPTIONS = [
  { value: 'Unisex', label: 'Unisex' },
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
]

const TALLAS_COMUNES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única', '28', '30', '32', '34', '36', '38', '40']

export function ProductModal({ open, product, onClose, onSubmit, categories: initialCategories = [], marcas: initialMarcas = [] }: Props) {
  const { user } = useAuth()
  const [form, setForm] = useState<any>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [categoriesList, setCategoriesList] = useState(initialCategories)
  const [marcasList, setMarcasList] = useState(initialMarcas)
  const isEdit = !!product

  // Cargar categorías y marcas de base de datos si no vienen por props
  useEffect(() => {
    if (initialCategories.length > 0) {
      setCategoriesList(initialCategories)
    } else {
      getCategories().then(setCategoriesList)
    }

    if (initialMarcas.length > 0) {
      setMarcasList(initialMarcas)
    } else {
      getMarcas().then(setMarcasList)
    }
  }, [initialCategories, initialMarcas, open])

  useEffect(() => {
    if (product) {
      setForm({ 
        ...product,
        category: product.category_id?.toString() || product.category || '1',
        category_id: product.category_id || (product.category ? Number(product.category) : 1),
        brand: product.id_marca?.toString() || product.brand || '1',
        id_marca: product.id_marca || (product.brand ? Number(product.brand) : 1),
        condition: (product.condition?.toUpperCase() === 'NUEVO' ? 'NUEVO' : 'USADO'),
        gender: product.gender || 'Unisex',
        size: product.size || 'M',
        color: product.color || 'Combinado',
        status: product.status || 'published',
      })
    } else {
      setForm(EMPTY)
    }
    setFieldError(null)
  }, [product, open])

  const set = (key: string, value: any) =>
    setForm((f: any) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setFieldError('El nombre del producto es requerido.')
    if (form.price <= 0) return setFieldError('El precio debe ser mayor a $0 COP.')
    if (form.stock < 0) return setFieldError('El stock no puede ser negativo.')

    setSubmitting(true)
    setFieldError(null)

    // Normalizar category_id e id_marca para enviar tanto IDs como nombres
    const catIdNum = Number(form.category) || Number(form.category_id) || 1
    const marcaIdNum = Number(form.brand) || Number(form.id_marca) || 1

    const payload = {
      ...form,
      category_id: catIdNum,
      category: String(catIdNum),
      id_marca: marcaIdNum,
      brand: String(marcaIdNum),
    }

    const { error } = await onSubmit(payload)
    
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
      const formData = new FormData()
      formData.append('file', file)
      if (user?.id) formData.append('userId', user.id)

      const res = await fetch('/api/prendas/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al subir la imagen')
      }

      set('image_url', data.url)
    } catch (err: any) {
      setFieldError('Error al subir imagen: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" style={{ maxWidth: 640 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">{isEdit ? 'Editar Prenda' : 'Nueva Prenda'}</p>
            <h2 className="modal-title">{isEdit ? product!.name : 'Añadir al Catálogo'}</h2>
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
              <label className="field-label">Nombre de la Prenda *</label>
              <input
                className="field-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ej. Camiseta Nike Vintage"
                required
              />
            </div>

            {/* Categoría & Marca */}
            <div className="field">
              <label className="field-label">Categoría *</label>
              <select
                className="field-input"
                value={form.category || form.category_id || ''}
                onChange={(e) => {
                  set('category', e.target.value)
                  set('category_id', Number(e.target.value))
                }}
                required
              >
                <option value="">Selecciona categoría</option>
                {categoriesList.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Marca *</label>
              <select
                className="field-input"
                value={form.brand || form.id_marca || ''}
                onChange={(e) => {
                  set('brand', e.target.value)
                  set('id_marca', Number(e.target.value))
                }}
                required
              >
                <option value="">Selecciona marca</option>
                {marcasList.map(m => (
                  <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
                ))}
              </select>
            </div>

            {/* Estado de la prenda (Condición) & Talla */}
            <div className="field">
              <label className="field-label">Estado de la Prenda *</label>
              <select
                className="field-input"
                value={form.condition}
                onChange={(e) => set('condition', e.target.value)}
                required
              >
                {CONDICIONES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Talla *</label>
              <select
                className="field-input"
                value={form.size}
                onChange={(e) => set('size', e.target.value)}
                required
              >
                {TALLAS_COMUNES.map(t => (
                  <option key={t} value={t}>Talla {t}</option>
                ))}
              </select>
            </div>

            {/* Precio & Stock */}
            <div className="field">
              <label className="field-label">Precio de Venta (COP) *</label>
              <div className="field-prefix-wrapper">
                <span className="field-prefix">$</span>
                <input
                  className="field-input with-prefix"
                  type="number"
                  min="1000"
                  step="500"
                  value={form.price}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
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

            {/* Color & Género */}
            <div className="field">
              <label className="field-label">Color</label>
              <input
                className="field-input"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                placeholder="Ej. Negro, Azul, Blanco..."
              />
            </div>

            <div className="field">
              <label className="field-label">Género</label>
              <select
                className="field-input"
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                {GENEROS_OPTIONS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Image Selection */}
            <div className="field col-span-2">
              <label className="field-label">Fotografía de la Prenda</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label 
                  htmlFor="imagen-upload"
                  style={{ 
                    width: 110, height: 110, border: '2px dashed var(--border)', 
                    borderRadius: 14, overflow: 'hidden', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                  }}
                  title="Toca para subir foto de la prenda"
                >
                  {form.image_url ? (
                    <img src={form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: 8 }}>
                      <span style={{ fontSize: 24, color: 'var(--accent)', display: 'block' }}>+</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Subir foto</span>
                    </div>
                  )}
                </label>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                      borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer',
                      fontWeight: 600, width: 'fit-content'
                    }}
                  >
                    Seleccionar de mi dispositivo
                  </button>

                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    O introduce el enlace de la imagen:
                  </p>
                  <input
                    className="field-input"
                    value={(form.image_url as string) || ''}
                    onChange={(e) => set('image_url', e.target.value)}
                    placeholder="https://misitio.com/foto.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="field col-span-2">
              <label className="field-label">Descripción</label>
              <textarea
                className="field-input field-textarea"
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe los detalles, tela, uso o estilo de la prenda..."
              />
            </div>
          </div>

          {fieldError && <p className="form-error">{fieldError}</p>}

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Guardando prenda...'
                : isEdit
                ? 'Guardar Cambios'
                : 'Publicar Prenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}