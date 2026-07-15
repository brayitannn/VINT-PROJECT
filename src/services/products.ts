'use client'

import { getSupabaseClient } from '@/lib/supabase/client'
import { API_BASE_URL } from '@/lib/api'
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
    const supabase = getSupabaseClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token || ''

    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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
    const supabase = getSupabaseClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token || ''

    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
    const supabase = getSupabaseClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token || ''

    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
    const supabase = getSupabaseClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token || ''

    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
    const supabase = getSupabaseClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token || ''

    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ids }),
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error ?? 'Error al eliminar' }
    return { error: null }
  } catch (err: any) {
    return { error: err.message }
  }
}

// ── Categories & Brands fetched dynamically from API ────────────────────────
export async function getCategories(): Promise<{ id: string; nombre: string; descripcion?: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/categories`)
    if (!res.ok) {
      console.warn('API returned non-ok status for categories, using fallback.')
      return [
        { id: '1', nombre: 'Camisetas' },
        { id: '2', nombre: 'Pantalones' },
        { id: '3', nombre: 'Chaquetas' },
        { id: '4', nombre: 'Vestidos' },
        { id: '5', nombre: 'Calzado' },
        { id: '6', nombre: 'Accesorios' },
        { id: '8', nombre: 'Deportiva' },
        { id: '10', nombre: 'Faldas' },
        { id: '22', nombre: 'Shorts' },
      ]
    }
    const json = await res.json()
    return (json.data || []).map((c: any) => ({
      id: String(c.id_categoria),
      nombre: c.nombre,
      descripcion: c.descripcion || '',
    }))
  } catch (err) {
    console.warn('Error fetching categories from API, using fallback:', err)
    return [
      { id: '1', nombre: 'Camisetas' },
      { id: '2', nombre: 'Pantalones' },
      { id: '3', nombre: 'Chaquetas' },
      { id: '4', nombre: 'Vestidos' },
      { id: '5', nombre: 'Calzado' },
      { id: '6', nombre: 'Accesorios' },
      { id: '8', nombre: 'Deportiva' },
      { id: '10', nombre: 'Faldas' },
      { id: '22', nombre: 'Shorts' },
    ]
  }
}

export async function getMarcas(): Promise<{ id_marca: string; nombre: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/brands`)
    if (!res.ok) {
      console.warn('API returned non-ok status for brands, using fallback.')
      return [
        { id_marca: '1', nombre: 'Nike' },
        { id_marca: '2', nombre: 'Adidas' },
        { id_marca: '3', nombre: 'Zara' },
        { id_marca: '4', nombre: 'H&M' },
        { id_marca: '5', nombre: "Levi's" },
        { id_marca: '9', nombre: 'Sin marca' },
      ]
    }
    const json = await res.json()
    return (json.data || []).map((m: any) => ({
      id_marca: String(m.id_marca),
      nombre: m.nombre,
    }))
  } catch (err) {
    console.warn('Error fetching brands from API, using fallback:', err)
    return [
      { id_marca: '1', nombre: 'Nike' },
      { id_marca: '2', nombre: 'Adidas' },
      { id_marca: '3', nombre: 'Zara' },
      { id_marca: '4', nombre: 'H&M' },
      { id_marca: '5', nombre: "Levi's" },
      { id_marca: '9', nombre: 'Sin marca' },
    ]
  }
}