'use client'

import { getSupabaseClient } from './supabase/client'
import type { Product, ProductInsert, ProductUpdate, ProductFilters } from '@/types/product'

const VIEW = 'v_catalogo_publico'

// ── Mapper ─────────────────────────────────────────────────────────────────
function mapFromDB(item: any): Product {
  return {
    id: String(item.id_prenda),
    name: item.titulo || 'Sin título',
    description: item.descripcion || '',
    price: Number(item.precio) || 0,
    stock: item.stock || 1,
    sku: item.sku || '',
    category: item.categoria || 'General',
    category_id: item.id_categoria || null,
    status: (item.estado_publicacion?.toUpperCase() === 'DISPONIBLE' ? 'published' : 'draft') as any,
    image_url: item.imagen_principal || null,
    created_at: item.fecha_publicacion || new Date().toISOString(),
    updated_at: item.fecha_publicacion || new Date().toISOString(),
  }
}

// ── READ: Uses public view (no schema issue) ────────────────────────────────
export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  pageSize = 10
): Promise<{ data: Product[]; count: number; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from(VIEW)
      .select('*', { count: 'exact' })
      .range(from, to)

    if (filters.search) {
      query = query.or(`titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`)
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('categoria', filters.category)
    }

    const sortByMap: Record<string, string> = {
      name: 'titulo',
      price: 'precio',
      created_at: 'fecha_publicacion',
      updated_at: 'fecha_publicacion',
    }
    const sortBy = sortByMap[filters.sortBy ?? ''] ?? 'fecha_publicacion'
    const ascending = filters.sortOrder === 'asc'
    query = query.order(sortBy as string, { ascending })

    const { data, count, error } = await query

    if (error) {
      return { data: [], count: 0, error: error.message }
    }

    return {
      data: (data || []).map(mapFromDB),
      count: count ?? 0,
      error: null,
    }
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