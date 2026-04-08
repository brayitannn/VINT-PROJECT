import { createClient } from '@/lib/supabase/client'
import type { Product, ProductInsert, ProductUpdate, ProductFilters } from '@/types/product'

const TABLE = 'products'

// ─── Fetch all with filters + pagination ────────────────────────────────────
export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  pageSize = 10
): Promise<{ data: Product[]; count: number; error: string | null }> {
  const supabase = createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .range(from, to)

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
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

  return {
    data: (data as Product[]) ?? [],
    count: count ?? 0,
    error: error?.message ?? null,
  }
}

// ─── Fetch single ────────────────────────────────────────────────────────────
export async function getProductById(
  id: string
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  return { data: data as Product | null, error: error?.message ?? null }
}

// ─── Create ──────────────────────────────────────────────────────────────────
export async function createProduct(
  payload: ProductInsert
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single()

  return { data: data as Product | null, error: error?.message ?? null }
}

// ─── Update ──────────────────────────────────────────────────────────────────
export async function updateProduct(
  id: string,
  payload: ProductUpdate
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  return { data: data as Product | null, error: error?.message ?? null }
}

// ─── Delete ──────────────────────────────────────────────────────────────────
export async function deleteProduct(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ─── Bulk delete ─────────────────────────────────────────────────────────────
export async function deleteProducts(
  ids: string[]
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from(TABLE).delete().in('id', ids)
  return { error: error?.message ?? null }
}

// ─── Get unique categories ────────────────────────────────────────────────────
export async function getCategories(): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from(TABLE)
    .select('category')
    .not('category', 'is', null)

  const unique = [...new Set((data ?? []).map((r: { category: string }) => r.category))]
  return unique.filter(Boolean) as string[]
}