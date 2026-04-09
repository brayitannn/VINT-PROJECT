'use client'

import { useEffect, useState } from 'react'
import type { Product, ProductInsert, ProductUpdate, ProductStatus } from '@/types/product'

interface Props {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSubmit: (data: ProductInsert | ProductUpdate) => Promise<{ error: string | null }>
  marcas?: {id_marca: number, nombre: string}[]
}

const EMPTY: any = {
  id_usuario: 1, 
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

const CONDITION_OPTIONS = [
  { value: 'NUEVO', label: 'Nuevo con etiquetas' },
  { value: 'COMO_NUEVO', label: 'Como nuevo' },
  { value: 'USADO', label: 'Buen estado' },
  { value: 'DESGASTADO', label: 'Usado con detalles' },
]

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'OCULTO', label: 'Oculto' },
  { value: 'VENDIDO', label: 'Vendido' },
]

export function ProductModal({ open, product, onClose, onSubmit, marcas = [] }: Props) {
  const [form, setForm] = useState<any>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const isEdit = !!product

  useEffect(() => {
    if (product) {
      setForm({ ...product })
    } else {
      setForm(EMPTY)
    }
    setFieldError(null)
  }, [product, open])

  const set = (key: keyof ProductInsert, value: string | number) =>
    setForm((f: any) => ({ ...f, [key]: value }))

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSubmitting(true)
    setFieldError(null)

    try {
      // Simulamos la subida por ahora para que el usuario vea el cambio en la UI
      // En una implementación real usaríamos uploadProductImage del lib
      const reader = new FileReader()
      reader.onloadend = () => {
        set('imagen_url', reader.result as string)
        setSubmitting(false)
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      setFieldError("Error al cargar la imagen: " + err.message)
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
                {CONDITION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Categoría & Marca (Mejorado) */}
            <div className="field">
              <label className="field-label">Categoría</label>
              <select
                className="field-input"
                value={form.id_categoria}
                onChange={(e) => set('id_categoria', parseInt(e.target.value))}
              >
                {[
                  { id: 1, nombre: 'Hombre' },
                  { id: 2, nombre: 'Mujer' },
                  { id: 3, nombre: 'Unisex' },
                  { id: 4, nombre: 'Accesorios' },
                  { id: 5, nombre: 'Calzado' }
                ].map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Marca</label>
              <select
                className="field-input"
                value={form.id_marca}
                onChange={(e) => set('id_marca', parseInt(e.target.value))}
              >
                {marcas?.map(m => (
                  <option key={m.id_marca} value={m.id_marca}>{m.nombre}</option>
                ))}
              </select>
            </div>

            {/* Image Selection */}
            <div className="field col-span-2">
              <label className="field-label">Imagen de la prenda (Opcional por ahora)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label 
                  htmlFor="imagen-upload"
                  style={{ 
                    width: 120, height: 120, border: '2px dashed var(--color-border)', 
                    borderRadius: 12, overflow: 'hidden', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)',
                    cursor: 'pointer', flexShrink: 0
                  }}
                  title="Toca para subir foto desde tu galería"
                >
                  {form.imagen_url ? (
                    <img src={form.imagen_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 24, color: 'var(--color-text-muted)' }}>+</span>
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
                    Buscar en Galería
                  </button>

                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                    O pega una URL:
                  </p>
                  <input
                    className="field-input"
                    value={form.imagen_url as string}
                    onChange={(e) => set('imagen_url', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
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