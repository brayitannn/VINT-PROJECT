'use client'

import { useState } from 'react'
import { Plus, Edit3, Save, X, Loader2, Trash2, FolderOpen, Tag } from 'lucide-react'

export interface CatalogCategory {
  id: string
  nombre: string
  descripcion?: string
}

export interface CatalogBrand {
  id_marca: string
  nombre: string
}

interface CatalogManagerProps {
  categories: CatalogCategory[]
  brands: CatalogBrand[]
  onCreateCategory: (nombre: string, descripcion?: string) => Promise<void>
  onUpdateCategory: (id: string, nombre: string, descripcion?: string) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
  onCreateBrand: (nombre: string) => Promise<void>
  onUpdateBrand: (id: string, nombre: string) => Promise<void>
  onDeleteBrand: (id: string) => Promise<void>
  loading: boolean
}

type CatalogSubTab = 'categorias' | 'marcas'

export function CatalogManager({
  categories,
  brands,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateBrand,
  onUpdateBrand,
  onDeleteBrand,
  loading,
}: CatalogManagerProps) {
  const [subTab, setSubTab] = useState<CatalogSubTab>('categorias')

  // Categories form states
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [catCreating, setCatCreating] = useState(false)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatDesc, setEditCatDesc] = useState('')
  const [catSaving, setCatSaving] = useState(false)
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null)

  // Brands form states
  const [newBrandName, setNewBrandName] = useState('')
  const [brandCreating, setBrandCreating] = useState(false)
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null)
  const [editBrandName, setEditBrandName] = useState('')
  const [brandSaving, setBrandSaving] = useState(false)
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null)

  // Handlers for Categories
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    setCatCreating(true)
    await onCreateCategory(newCatName.trim(), newCatDesc.trim() || undefined)
    setNewCatName('')
    setNewCatDesc('')
    setCatCreating(false)
  }

  const handleSaveCatEdit = async (id: string) => {
    if (!editCatName.trim()) return
    setCatSaving(true)
    await onUpdateCategory(id, editCatName.trim(), editCatDesc.trim() || undefined)
    setEditingCatId(null)
    setCatSaving(false)
  }

  const handleDeleteCategory = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombre}"?`)) {
      setDeletingCatId(id)
      await onDeleteCategory(id)
      setDeletingCatId(null)
    }
  }

  // Handlers for Brands
  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return
    setBrandCreating(true)
    await onCreateBrand(newBrandName.trim())
    setNewBrandName('')
    setBrandCreating(false)
  }

  const handleSaveBrandEdit = async (id: string) => {
    if (!editBrandName.trim()) return
    setBrandSaving(true)
    await onUpdateBrand(id, editBrandName.trim())
    setEditingBrandId(null)
    setBrandSaving(false)
  }

  const handleDeleteBrand = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la marca "${nombre}"?`)) {
      setDeletingBrandId(id)
      await onDeleteBrand(id)
      setDeletingBrandId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Sub tabs selector */}
      <div style={{
        display: 'flex',
        gap: 12,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 12,
      }}>
        <button
          onClick={() => setSubTab('categorias')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8, border: 'none',
            backgroundColor: subTab === 'categorias' ? 'var(--accent-light)' : 'transparent',
            color: subTab === 'categorias' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <FolderOpen size={16} />
          Categorías ({categories.length})
        </button>
        <button
          onClick={() => setSubTab('marcas')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8, border: 'none',
            backgroundColor: subTab === 'marcas' ? 'var(--accent-light)' : 'transparent',
            color: subTab === 'marcas' ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <Tag size={16} />
          Marcas ({brands.length})
        </button>
      </div>

      {subTab === 'categorias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Create category card */}
          <div style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 24,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Crear nueva categoría
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Añade una categoría al catálogo de filtros y carga de prendas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nombre de la categoría (ej: Vestidos Vintage)"
                  style={{
                    flex: '1 1 250px', padding: '10px 16px', borderRadius: 12, fontSize: 14,
                    border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)', outline: 'none',
                    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Descripción (opcional)"
                  style={{
                    flex: '2 1 400px', padding: '10px 16px', borderRadius: 12, fontSize: 14,
                    border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)', outline: 'none',
                    fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={handleCreateCategory}
                disabled={catCreating || !newCatName.trim()}
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 20px', borderRadius: 12, border: 'none',
                  backgroundColor: 'var(--accent)', color: 'white',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: catCreating || !newCatName.trim() ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {catCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Crear Categoría
              </button>
            </div>
          </div>

          {/* List categories */}
          <div style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Nombre</th>
                  <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Descripción</th>
                  <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id
                  return (
                    <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--text-muted)' }}>{cat.id}</td>
                      <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, fontSize: 14,
                              border: '1px solid var(--accent)', backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)', outline: 'none',
                              width: '100%', boxSizing: 'border-box',
                            }}
                          />
                        ) : (
                          cat.nombre
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--text-secondary)' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCatDesc}
                            onChange={(e) => setEditCatDesc(e.target.value)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, fontSize: 14,
                              border: '1px solid var(--accent)', backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)', outline: 'none',
                              width: '100%', boxSizing: 'border-box',
                            }}
                          />
                        ) : (
                          cat.descripcion || '-'
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveCatEdit(cat.id)}
                                disabled={catSaving || !editCatName.trim()}
                                style={{
                                  border: 'none', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'var(--accent)', color: 'white',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                {catSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingCatId(null)}
                                style={{
                                  border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                <X size={12} />
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCatId(cat.id)
                                  setEditCatName(cat.nombre)
                                  setEditCatDesc(cat.descripcion || '')
                                }}
                                style={{
                                  border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                                }}
                              >
                                <Edit3 size={12} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                                disabled={deletingCatId === cat.id}
                                style={{
                                  border: 'none', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                                }}
                              >
                                {deletingCatId === cat.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      No hay categorías en el sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'marcas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Create brand card */}
          <div style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 24,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Crear nueva marca
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Añade una marca al catálogo para asociar las prendas a ella.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Nombre de la marca (ej: Patagonia)"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBrand()}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 12, fontSize: 14,
                  border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)', outline: 'none',
                  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleCreateBrand}
                disabled={brandCreating || !newBrandName.trim()}
                style={{
                  padding: '10px 20px', borderRadius: 12, border: 'none',
                  backgroundColor: 'var(--accent)', color: 'white',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: brandCreating || !newBrandName.trim() ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {brandCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Crear Marca
              </button>
            </div>
          </div>

          {/* List brands */}
          <div style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Nombre</th>
                  <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => {
                  const isEditing = editingBrandId === brand.id_marca
                  return (
                    <tr key={brand.id_marca} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 24px', fontSize: 14, color: 'var(--text-muted)' }}>{brand.id_marca}</td>
                      <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editBrandName}
                            onChange={(e) => setEditBrandName(e.target.value)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, fontSize: 14,
                              border: '1px solid var(--accent)', backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-primary)', outline: 'none',
                              width: '100%', boxSizing: 'border-box',
                            }}
                          />
                        ) : (
                          brand.nombre
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveBrandEdit(brand.id_marca)}
                                disabled={brandSaving || !editBrandName.trim()}
                                style={{
                                  border: 'none', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'var(--accent)', color: 'white',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                {brandSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingBrandId(null)}
                                style={{
                                  border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                <X size={12} />
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingBrandId(brand.id_marca)
                                  setEditBrandName(brand.nombre)
                                }}
                                style={{
                                  border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                                }}
                              >
                                <Edit3 size={12} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteBrand(brand.id_marca, brand.nombre)}
                                disabled={deletingBrandId === brand.id_marca}
                                style={{
                                  border: 'none', padding: '6px 12px', borderRadius: 8,
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)',
                                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                                }}
                              >
                                {deletingBrandId === brand.id_marca ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {brands.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                      No hay marcas en el sistema.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
