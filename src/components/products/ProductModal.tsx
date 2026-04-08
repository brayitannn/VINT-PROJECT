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
  id_usuario: 1, // Por ahora quemado, debería venir del UserContext
  id_categoria: 1,
  id_marca: 1,
  titulo: '',
  descripcion: '',
  talla: '',
  color: '',
  precio: 0,
  genero: 'Unisex',
  condicion: 'NUEVO',
  estado_publicacion: 'DISPONIBLE',
  imagen_url: '',
}

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'OCULTO', label: 'Oculto' },
  { value: 'VENDIDO', label: 'Vendido' },
]

export function ProductModal({ open, product, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ProductInsert>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const isEdit = !!product

  useEffect(() => {
    if (product) {
      setForm({
        id_usuario: product.id_usuario,
        id_categoria: product.id_categoria,
        id_marca: product.id_marca,
        titulo: product.titulo,
        descripcion: product.descripcion ?? '',
        talla: product.talla ?? '',
        color: product.color ?? '',
        precio: product.precio,
        genero: product.genero ?? '',
        condicion: product.condicion ?? '',
        estado_publicacion: product.estado_publicacion,
        imagen_url: product.imagen_url ?? '',
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
    if (!form.titulo.trim()) return setFieldError('El título es requerido.')
    if (form.precio < 0) return setFieldError('El precio no puede ser negativo.')

    setSubmitting(true)
    setFieldError(null)

    const payload = { ...form }
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
            <p className="modal-eyebrow">{isEdit ? 'Editar prenda' : 'Nueva prenda'}</p>
            <h2 className="modal-title">{isEdit ? product!.titulo : 'Publicar prenda'}</h2>
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
            {/* Título */}
            <div className="field col-span-2">
              <label className="field-label">Título *</label>
              <input
                className="field-input"
                value={form.titulo}
                onChange={(e) => set('titulo', e.target.value)}
                placeholder="Camiseta Nike Vintage..."
                required
              />
            </div>

            {/* Precio */}
            <div className="field">
              <label className="field-label">Precio *</label>
              <div className="field-prefix-wrapper">
                <span className="field-prefix">$</span>
                <input
                  className="field-input with-prefix"
                  type="number"
                  min="0"
                  step="100"
                  value={form.precio}
                  onChange={(e) => set('precio', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="field">
              <label className="field-label">Publicación</label>
              <select
                className="field-input"
                value={form.estado_publicacion}
                onChange={(e) => set('estado_publicacion', e.target.value as ProductStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Talla & Color */}
            <div className="field">
              <label className="field-label">Talla</label>
              <input
                className="field-input"
                value={form.talla as string}
                onChange={(e) => set('talla', e.target.value)}
                placeholder="S, M, L, XL..."
              />
            </div>
            <div className="field">
              <label className="field-label">Color</label>
              <input
                className="field-input"
                value={form.color as string}
                onChange={(e) => set('color', e.target.value)}
                placeholder="Negro, Azul..."
              />
            </div>

            {/* Género & Condición */}
            <div className="field">
              <label className="field-label">Género</label>
              <select
                className="field-input"
                value={form.genero as string}
                onChange={(e) => set('genero', e.target.value)}
              >
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Condición</label>
              <select
                className="field-input"
                value={form.condicion as string}
                onChange={(e) => set('condicion', e.target.value)}
              >
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
              </select>
            </div>

            {/* Categoría & Marca (Por ahora numérico/quemado) */}
            <div className="field">
              <label className="field-label">ID Categoría</label>
              <input
                className="field-input"
                type="number"
                value={form.id_categoria}
                onChange={(e) => set('id_categoria', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="field">
              <label className="field-label">ID Marca</label>
              <input
                className="field-input"
                type="number"
                value={form.id_marca}
                onChange={(e) => set('id_marca', parseInt(e.target.value) || 1)}
              />
            </div>

            {/* Image URL */}
            <div className="field col-span-2">
              <label className="field-label">URL de imagen (Galería futura)</label>
              <input
                className="field-input"
                value={form.imagen_url as string}
                onChange={(e) => set('imagen_url', e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Description */}
            <div className="field col-span-2">
              <label className="field-label">Descripción</label>
              <textarea
                className="field-input field-textarea"
                value={form.descripcion as string}
                onChange={(e) => set('descripcion', e.target.value)}
                placeholder="Describe tu prenda..."
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
              ) : isEdit ? 'Guardar cambios' : 'Publicar prenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}