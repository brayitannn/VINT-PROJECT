import { createClient } from '@/lib/supabase/client'
import type { Product, ProductInsert, ProductUpdate, ProductFilters } from '@/types/product'

const TABLE = 'products'

export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  pageSize = 10
): Promise<{ data: Product[]; count: number; error: string | null }> {
  try {
    const supabase = createClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase.from(TABLE).select('*', { count: 'exact' }).range(from, to)

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    const sortBy = filters.sortBy ?? 'created_at'
    const ascending = filters.sortOrder === 'asc'
    query = query.order(sortBy as string, { ascending })

    const { data, count, error } = await query

    if (error) {
      return { data: [], count: 0, error: error.message }
    }

    return {
      data: data as Product[],
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
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return { data: null, error: error?.message ?? null }
  return { data: data as Product, error: null }
}

export async function createProduct(
  payload: ProductInsert
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

export async function updateProduct(
  id: string,
  payload: ProductUpdate
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Product, error: null }
}

export async function deleteProduct(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  return { error: error?.message ?? null }
}

export async function deleteProducts(
  ids: string[]
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from(TABLE).delete().in('id', ids)
  return { error: error?.message ?? null }
}

// These are basically stubs now or can be extracted dynamically from existing products if needed
export async function getCategories(): Promise<{id: string, nombre: string}[]> {
  return [
    { id: 'Hombre', nombre: 'Hombre' },
    { id: 'Mujer', nombre: 'Mujer' },
    { id: 'Unisex', nombre: 'Unisex' },
    { id: 'Accesorios', nombre: 'Accesorios' },
    { id: 'Calzado', nombre: 'Calzado' },
  ]
}

export async function getMarcas(): Promise<{id_marca: string, nombre: string}[]> {
  // Mock as strings because table 'products' doesn't use brand, but maybe it can be added to description
  return [
    { id_marca: 'Nike', nombre: 'Nike' },
    { id_marca: 'Adidas', nombre: 'Adidas' },
    { id_marca: 'Zara', nombre: 'Zara' },
  ]
}