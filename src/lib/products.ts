import { createClient } from '@/lib/supabase/client'
import type { Product, ProductInsert, ProductUpdate, ProductFilters } from '@/types/product'

const TABLE = 'prendas'

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
    .select('*, imagenes_prendas(url_imagen)', { count: 'exact' })
    .range(from, to)

  if (filters.search) {
    query = query.or(
      `titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`
    )
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('estado_publicacion', filters.status)
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('id_categoria', filters.category)
  }

  const sortBy = filters.sortBy ?? 'fecha_publicacion'
  const ascending = filters.sortOrder === 'asc'
  query = query.order(sortBy as string, { ascending })

  const { data, count, error } = await query

  if (error) {
    return { data: [], count: 0, error: error.message }
  }

  // Format array to extract first image
  const formattedData: Product[] = (data || []).map((item: any) => {
    const imagenes = Array.isArray(item.imagenes_prendas) ? item.imagenes_prendas : []
    const firstImage = imagenes.length > 0 ? imagenes[0].url_imagen : null
    
    // Remove the joined raw array and embed imagen_url
    delete item.imagenes_prendas
    return { ...item, imagen_url: firstImage } as Product
  })

  return {
    data: formattedData,
    count: count ?? 0,
    error: null,
  }
}

export async function getProductById(
  id: string
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, imagenes_prendas(url_imagen)')
    .eq('id_prenda', id)
    .single()

  if (error || !data) return { data: null, error: error?.message ?? null }

  const imagenes = Array.isArray(data.imagenes_prendas) ? data.imagenes_prendas : []
  const firstImage = imagenes.length > 0 ? imagenes[0].url_imagen : null
  delete data.imagenes_prendas
  
  return { data: { ...data, imagen_url: firstImage } as Product, error: null }
}

export async function createProduct(
  payload: ProductInsert
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()
  
  const { imagen_url, ...dbPayload } = payload

  // 1. Insert Prenda
  const { data, error } = await supabase
    .from(TABLE)
    // Se inserta con datos simulados quemados que requiere la DB (para prueba, o asumiendo id 1 temporales)
    // Si ya trae id_usuario, perfecto.
    .insert([dbPayload])
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  // 2. Insert Imagen si fue enviada
  if (imagen_url && data) {
    await supabase.from('imagenes_prendas').insert([{
      id_prenda: data.id_prenda,
      url_imagen: imagen_url,
      es_principal: true,
      orden: 0
    }])
  }

  return { data: { ...data, imagen_url } as Product, error: null }
}

export async function updateProduct(
  id: string,
  payload: ProductUpdate
): Promise<{ data: Product | null; error: string | null }> {
  const supabase = createClient()

  // Extraer imagen temporalmente
  const { imagen_url, ...dbPayload } = payload

  const { data, error } = await supabase
    .from(TABLE)
    .update(dbPayload)
    .eq('id_prenda', id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  // Si envian imagen, actualizamos (simplificado: borramos sus imagenes y metemos la nueva, o simplemente insertamos)
  if (imagen_url !== undefined) {
    // Si la idea es remplazar la imagen:
    await supabase.from('imagenes_prendas').delete().eq('id_prenda', id)
    if (imagen_url) {
      await supabase.from('imagenes_prendas').insert([{
        id_prenda: id,
        url_imagen: imagen_url,
        es_principal: true,
        orden: 0
      }])
    }
  }

  return { data: { ...data, imagen_url } as Product, error: null }
}

export async function deleteProduct(
  id: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from(TABLE).delete().eq('id_prenda', id)
  return { error: error?.message ?? null }
}

export async function deleteProducts(
  ids: string[]
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from(TABLE).delete().in('id_prenda', ids)
  return { error: error?.message ?? null }
}

export async function getCategories(): Promise<{id: number, nombre: string}[]> {
  // A futuro lo sacas de una tabla 'categorias'. Por ahora devolvemos estáticas o de catálogo
  return [
    { id: 1, nombre: 'Hombre' },
    { id: 2, nombre: 'Mujer' },
    { id: 3, nombre: 'Unisex' },
  ]
}

export async function getMarcas(): Promise<{id_marca: number, nombre: string}[]> {
  // Catálogo extraído directamente de tu base de datos para sincronización manual:
  const marcas = [
    { id_marca: 1, nombre: 'Nike' },
    { id_marca: 2, nombre: 'Adidas' },
    { id_marca: 3, nombre: 'Zara' },
    { id_marca: 4, nombre: 'H&M' },
    { id_marca: 5, nombre: 'Levi\'s' },
    { id_marca: 6, nombre: 'Pull&Bear' },
    { id_marca: 7, nombre: 'Bershka' },
    { id_marca: 8, nombre: 'Tommy Hilfiger' },
    { id_marca: 9, nombre: 'Sin marca' },
    { id_marca: 32, nombre: 'Chevignon' },
    { id_marca: 33, nombre: 'Tennis' },
    { id_marca: 34, nombre: 'Arturo Calle' },
    { id_marca: 35, nombre: 'Americanino' },
    { id_marca: 36, nombre: 'Calvin Klein' },
    { id_marca: 37, nombre: 'GAP' },
    { id_marca: 38, nombre: 'Forever 21' },
    { id_marca: 39, nombre: 'Mango' },
    { id_marca: 40, nombre: 'Stradivarius' }
  ];

  return marcas.sort((a,b) => a.nombre.localeCompare(b.nombre));
}