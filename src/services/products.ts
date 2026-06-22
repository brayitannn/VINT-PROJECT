'use client'

import { getSupabaseClient } from '@/lib/supabase/client'
import type { Product, ProductInsert, ProductUpdate, ProductFilters } from '@/types/product'

const VIEW = 'v_catalogo_publico'

// ── Mapper ─────────────────────────────────────────────────────────────────
function mapFromDB(item: any): Product {
  const dbStatus = (item.estado_publicacion || '').toUpperCase()
  let status: 'published' | 'draft' | 'archived' = 'draft'
  if (dbStatus === 'DISPONIBLE') status = 'published'
  else if (dbStatus === 'VENDIDA') status = 'archived'
  // PAUSADA → draft (default)

  return {
    id: String(item.id_prenda || item.id),
    name: item.titulo || item.name || 'Sin título',
    description: item.descripcion || item.description || '',
    price: Number(item.precio ?? item.price) || 0,
    stock: item.stock || 1,
    sku: item.sku || '',
    category: item.categoria || item.category || 'General',
    category_id: item.id_categoria ?? item.category_id ?? null,
    status,
    image_url: item.imagen_principal ?? item.image_url ?? null,
    created_at: item.fecha_publicacion || item.created_at || new Date().toISOString(),
    updated_at: item.fecha_publicacion || item.updated_at || new Date().toISOString(),
  }
}

// ── READ: Uses authenticated API to get seller's own products ──────────────
export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  pageSize = 10
): Promise<{ data: Product[]; count: number; error: string | null }> {
  try {
    const res = await fetch('/api/products', { method: 'GET' })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      return { data: [], count: 0, error: json.error ?? 'Error al cargar productos' }
    }
    const json = await res.json()
    let products: Product[] = (json.data || []).map((p: any) =>
      // API already maps the shape, but run through mapFromDB for safety
      (p.estado_publicacion !== undefined ? mapFromDB(p) : p) as Product
    )

    // Client-side filtering (search, status, category)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      )
    }
    if (filters.status && filters.status !== 'all') {
      products = products.filter((p) => p.status === filters.status)
    }
    if (filters.category && filters.category !== 'all') {
      products = products.filter((p) => p.category === filters.category)
    }

    // Client-side sort
    const sortKey = (
      filters.sortBy === 'name' ? 'name' :
      filters.sortBy === 'price' ? 'price' : 'created_at'
    ) as keyof Product
    const asc = filters.sortOrder === 'asc' ? 1 : -1
    products.sort((a, b) => {
      const av = a[sortKey] as any
      const bv = b[sortKey] as any
      return av < bv ? -asc : av > bv ? asc : 0
    })

    // Client-side pagination
    const total = products.length
    const from = (page - 1) * pageSize
    const paginated = products.slice(from, from + pageSize)

    return { data: paginated, count: total, error: null }
  } catch (err: any) {
    return { data: [], count: 0, error: err.message }
  }
}

export async function getProductById(
  id: string
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from(VIEW)
    .select('*')
    .eq('id_prenda', id)
    .single()

  if (error || !data) return { data: null, error: error?.message ?? null }
  return { data: mapFromDB(data), error: null }
}

// ── WRITE: Use secure API Route ────────────────────────────────────────────
export async function createProduct(
  payload: ProductInsert
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        image_url: payload.image_url,
        status: payload.status || 'draft',
      }),
    })

    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error ?? 'Error al crear el producto' }

    return { data: json.data ? mapFromDB(json.data) : null, error: null }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

export async function updateProduct(
  id: string,
  payload: ProductUpdate
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const res = await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    })

    const json = await res.json()
    if (!res.ok) return { data: null, error: json.error ?? 'Error al actualizar' }
    return { data: json.data ? mapFromDB(json.data) : null, error: null }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

export async function deleteProduct(
  id: string
): Promise<{ error: string | null }> {
  try {
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error ?? 'Error al eliminar' }
    return { error: null }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteProducts(
  ids: string[]
): Promise<{ error: string | null }> {
  try {
    const res = await fetch('/api/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error ?? 'Error al eliminar' }
    return { error: null }
  } catch (err: any) {
    return { error: err.message }
  }
}

// ── Mock data for categories (hasta que se sincronice con BD) ─────────────
export async function getCategories(): Promise<{ id: string; nombre: string }[]> {
  return [
    { id: '1', nombre: 'HOMBRE' },
    { id: '2', nombre: 'MUJER' },
    { id: '3', nombre: 'UNISEX' },
    { id: '4', nombre: 'ACCESORIOS' },
    { id: '5', nombre: 'CALZADO' },
  ]
}

export async function getMarcas(): Promise<{ id_marca: string; nombre: string }[]> {
  return [
    { id_marca: 'Nike', nombre: 'Nike' },
    { id_marca: 'Adidas', nombre: 'Adidas' },
    { id_marca: 'Zara', nombre: 'Zara' },
    { id_marca: 'H&M', nombre: 'H&M' },
    { id_marca: 'Otro', nombre: 'Otro' },
  ]
}