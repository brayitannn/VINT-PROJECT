'use client'

import { useEffect, useState, useRef } from 'react'
import { Search, ChevronDown, Check, Tag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { Product, ProductInsert, ProductUpdate, ProductStatus } from '@/types/product'
import { getCategories, getMarcas, getEstadosPrenda, type EstadoPrendaOption } from '@/services/products'

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
  id_marca: 9, // Sin marca por defecto
  brand: "Sin marca",
  otra_marca: null,
  status: "published",
  image_url: "",
  size: "M",
  color: "Combinado",
  gender: "Unisex",
  condition: "Buen estado",
  id_estado_prenda: 4,
}

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'published', label: 'Publicado (En Venta)' },
  { value: 'archived', label: 'Oculto / Pausada' },
  { value: 'sold', label: 'Vendida' },
  { value: 'draft', label: 'Borrador' },
]

const GENEROS_OPTIONS = [
  { value: 'Unisex', label: 'Unisex' },
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Niños', label: 'Niños' },
]

const COLORES_OPTIONS = [
  'Combinado',
  'Negro',
  'Blanco',
  'Azul',
  'Rojo',
  'Verde',
  'Gris',
  'Beis',
  'Café',
  'Rosado',
  'Morado',
  'Camel',
  'Floral / Estampado',
  'A cuadros',
]

const TALLAS_COMUNES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única', '28', '30', '32', '34', '36', '38', '40']

export function ProductModal({ open, product, onClose, onSubmit, categories: initialCategories = [], marcas: initialMarcas = [] }: Props) {
  const { user } = useAuth()
  const [form, setForm] = useState<any>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [categoriesList, setCategoriesList] = useState(initialCategories)
  const [marcasList, setMarcasList] = useState(initialMarcas)
  const [estadosPrendaList, setEstadosPrendaList] = useState<EstadoPrendaOption[]>([])

  // Control para desplegable predictivo de marca
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false)
  const [brandSearch, setBrandSearch] = useState('')
  const brandRef = useRef<HTMLDivElement>(null)
  const brandSearchInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!product

  // Cargar categorías, marcas y estados de prenda
  useEffect(() => {
    if (!open) return

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

    getEstadosPrenda().then(setEstadosPrendaList)
  }, [initialCategories, initialMarcas, open])

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Autoenfocar campo de búsqueda al abrir el dropdown
  useEffect(() => {
    if (brandDropdownOpen) {
      setTimeout(() => {
        brandSearchInputRef.current?.focus()
      }, 50)
    } else {
      setBrandSearch('')
    }
  }, [brandDropdownOpen])

  useEffect(() => {
    if (product) {
      const isOtra = product.id_marca === 41 || product.brand === 'Otra' || !!product.otra_marca
      setForm({ 
        ...product,
        category: product.category_id?.toString() || product.category || '1',
        category_id: product.category_id || (product.category ? Number(product.category) : 1),
        brand: isOtra ? 'Otra' : (product.brand || 'Sin marca'),
        id_marca: isOtra ? 41 : (product.id_marca || 9),
        otra_marca: product.otra_marca || (isOtra ? product.brand : ''),
        condition: product.condition || 'Buen estado',
        id_estado_prenda: product.id_estado_prenda || 4,
        gender: product.gender || 'Unisex',
        size: product.size || 'M',
        color: product.color || 'Combinado',
        status: product.status || 'published',
      })
    } else {
      setForm(EMPTY)
    }
    setFieldError(null)
    setBrandDropdownOpen(false)
    setBrandSearch('')
  }, [product, open])

  const set = (key: string, value: any) =>
    setForm((f: any) => ({ ...f, [key]: value }))

  const handleSelectMarca = (marca: { id_marca: string | number; nombre: string }) => {
    const idNum = Number(marca.id_marca)
    if (idNum === 41 || marca.nombre.toLowerCase() === 'otra') {
      setForm((f: any) => ({
        ...f,
        id_marca: 41,
        brand: 'Otra',
      }))
    } else {
      setForm((f: any) => ({
        ...f,
        id_marca: idNum,
        brand: marca.nombre,
        otra_marca: '',
      }))
    }
    setBrandDropdownOpen(false)
    setBrandSearch('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return setFieldError('El nombre del producto es requerido.')
    if (form.price <= 0) return setFieldError('El precio debe ser mayor a $0 COP.')
    if (form.stock < 0) return setFieldError('El stock no puede ser negativo.')

    // Si seleccionó Otra, exigir el nombre de la marca
    if (Number(form.id_marca) === 41 && (!form.otra_marca || !form.otra_marca.trim())) {
      return setFieldError('Por favor escribe el nombre de la marca en el campo de texto.')
    }

    setSubmitting(true)
    setFieldError(null)

    // Normalizar IDs
    const catIdNum = Number(form.category) || Number(form.category_id) || 1
    // Si no seleccionó marca, por defecto 9 ("Sin marca")
    const marcaIdNum = Number(form.id_marca) || 9
    const isOtra = marcaIdNum === 41
    const finalBrandName = isOtra ? (form.otra_marca?.trim() || 'Otra') : (form.brand || 'Sin marca')
    const finalOtraMarca = isOtra ? form.otra_marca?.trim() : null

    // Encontrar nombre del estado si no está sincronizado
    let condName = form.condition || 'Buen estado'
    if (estadosPrendaList.length > 0 && form.id_estado_prenda) {
      const match = estadosPrendaList.find(e => e.id_estado_prenda === Number(form.id_estado_prenda))
      if (match) condName = match.nombre
    }

    const payload = {
      ...form,
      category_id: catIdNum,
      category: String(catIdNum),
      id_marca: marcaIdNum,
      brand: finalBrandName,
      otra_marca: finalOtraMarca,
      id_estado_prenda: form.id_estado_prenda || 4,
      condition: condName,
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

  // Filtro predictivo de marcas
  const searchLower = brandSearch.toLowerCase().trim()
  const regularMarcas = marcasList.filter(m => m.id_marca !== '41' && m.nombre.toLowerCase() !== 'otra')
  const filteredMarcas = searchLower
    ? regularMarcas.filter(m => m.nombre.toLowerCase().includes(searchLower))
    : regularMarcas

  // Marca actualmente seleccionada para mostrar en el botón
  const isOtraSelected = Number(form.id_marca) === 41
  const selectedBrandObj = marcasList.find(m => Number(m.id_marca) === Number(form.id_marca))
  const displayBrandLabel = isOtraSelected
    ? (form.otra_marca ? `Otra: ${form.otra_marca}` : 'Otra marca (Escribir)')
    : (selectedBrandObj?.nombre || form.brand || 'Sin marca')

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

            {/* Categoría */}
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

            {/* Marca con buscador interactivo y opción "Otra" */}
            <div className="field" ref={brandRef} style={{ position: 'relative' }}>
              <label className="field-label">Marca *</label>
              <button
                type="button"
                className="field-input"
                onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                  fontWeight: 500,
                  gap: 8,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Tag size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  {displayBrandLabel}
                </span>
                <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: brandDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>

              {/* Menú flotante de búsqueda */}
              {brandDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: 280,
                }}>
                  {/* Buscador de marca */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}>
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                    <input
                      ref={brandSearchInputRef}
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Buscar marca..."
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        width: '100%',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Lista de marcas filtradas */}
                  <div style={{
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: 180,
                  }}>
                    {/* Opción Sin marca siempre visible en lista si coincide */}
                    {filteredMarcas.length === 0 && !searchLower.includes('otra') && (
                      <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                        No se encontró &quot;{brandSearch}&quot;
                      </div>
                    )}

                    {filteredMarcas.map(m => {
                      const isSelected = Number(form.id_marca) === Number(m.id_marca) && !isOtraSelected
                      return (
                        <button
                          key={m.id_marca}
                          type="button"
                          onClick={() => handleSelectMarca(m)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                            background: isSelected ? 'rgba(139, 94, 60, 0.1)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary)'
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <span>{m.nombre}</span>
                          {isSelected && <Check size={14} style={{ color: 'var(--accent)' }} />}
                        </button>
                      )
                    })}

                    {/* Opción 'Otra' siempre de última en cualquier búsqueda */}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => handleSelectMarca({ id_marca: '41', nombre: 'Otra' })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          color: isOtraSelected ? 'var(--accent)' : 'var(--text-primary)',
                          background: isOtraSelected ? 'rgba(139, 94, 60, 0.1)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          if (!isOtraSelected) e.currentTarget.style.background = 'var(--bg-secondary)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isOtraSelected) e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🏷️</span>
                          <span>Otra (Ingresar nombre...)</span>
                        </span>
                        {isOtraSelected && <Check size={14} style={{ color: 'var(--accent)' }} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Campo para ingresar el nombre de la otra marca */}
              {isOtraSelected && (
                <div style={{ marginTop: 8 }}>
                  <label className="field-label" style={{ fontSize: 12, marginBottom: 4 }}>
                    Nombre de la Marca *
                  </label>
                  <input
                    className="field-input"
                    value={form.otra_marca || ''}
                    onChange={(e) => set('otra_marca', e.target.value)}
                    placeholder="Ej. Canabbis, Gucci, Levi's..."
                    required
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Estado de la prenda (Opciones reales de catalogo.estados_prenda) */}
            <div className="field">
              <label className="field-label">Estado de la Prenda *</label>
              <select
                className="field-input"
                value={form.id_estado_prenda || ''}
                onChange={(e) => {
                  const idNum = Number(e.target.value)
                  const matched = estadosPrendaList.find(x => x.id_estado_prenda === idNum)
                  set('id_estado_prenda', idNum)
                  set('condition', matched?.nombre || 'Buen estado')
                }}
                required
              >
                {estadosPrendaList.map(opt => (
                  <option key={opt.id_estado_prenda} value={opt.id_estado_prenda}>
                    {opt.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Talla */}
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

            {/* Estado de Publicación */}
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

            {/* Color (Selección cerrada sin escribir) */}
            <div className="field">
              <label className="field-label">Color *</label>
              <select
                className="field-input"
                value={form.color || 'Combinado'}
                onChange={(e) => set('color', e.target.value)}
                required
              >
                {COLORES_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Género */}
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

            {/* Fotografía de la Prenda */}
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