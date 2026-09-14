'use client'

import { getSupabaseClient } from '@/lib/supabase/client'
import { API_BASE_URL } from '@/lib/api'
import type { Product, ProductInsert, ProductUpdate, ProductFilters, ProductStatus } from '@/types/product'

const VIEW = 'v_catalogo_publico'

// ── Auth helper ─────────────────────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error || !data?.session?.access_token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.')
  }
  return data.session.access_token
}

// ── Mapper ─────────────────────────────────────────────────────────────────
function mapFromDB(item: any): Product {
  const dbStatus = (item.estado_publicacion || item.status || '').toUpperCase()
  let status: ProductStatus = 'draft'
  if (dbStatus === 'DISPONIBLE' || dbStatus === 'PUBLISHED') status = 'published'
  else if (dbStatus === 'VENDIDA' || dbStatus === 'SOLD') status = 'sold'
  else if (dbStatus === 'PAUSADA' || dbStatus === 'ARCHIVED' || dbStatus === 'OCULTO') status = 'archived'

  return {
    id: String(item.id_prenda || item.id),
    name: item.titulo || item.name || 'Sin título',
    description: item.descripcion || item.description || '',
    price: Number(item.precio ?? item.price) || 0,
    stock: item.stock || 1,
    sku: null,
    category: item.categoria || item.category || 'General',
    category_id: item.id_categoria ?? item.category_id ?? null,
    id_marca: item.id_marca ?? null,
    brand: item.marca || item.brand || null,
    status,
    image_url: item.imagen_principal ?? item.image_url ?? null,
    created_at: item.fecha_publicacion || item.created_at || new Date().toISOString(),
    updated_at: item.fecha_publicacion || item.updated_at || new Date().toISOString(),
    size: item.talla ?? item.size ?? null,
    color: item.color ?? null,
    gender: item.genero ?? item.gender ?? null,
    condition: item.condicion ?? item.estado_prenda ?? item.condition ?? null,
  }
}

/**
 * Obtiene el id_usuario numérico del usuario actual desde la vista pública o la tabla seguridad.
 */
async function getInternalUserId(
  supabase: ReturnType<typeof getSupabaseClient>,
  userAuthId?: string,
  email?: string
): Promise<number | null> {
  if (userAuthId) {
    try {
      const { data } = await supabase
        .from('v_usuarios_publico')
        .select('id_usuario')
        .eq('id_auth_supabase', userAuthId)
        .maybeSingle()
      if (data?.id_usuario) return Number(data.id_usuario)
    } catch {}
  }

  if (email) {
    try {
      const { data } = await supabase
        .from('v_usuarios_publico')
        .select('id_usuario')
        .eq('correo', email)
        .maybeSingle()
      if (data?.id_usuario) return Number(data.id_usuario)
    } catch {}
  }

  if (userAuthId) {
    try {
      const { data } = await supabase
        .schema('seguridad')
        .from('usuarios')
        .select('id_usuario')
        .eq('id_auth_supabase', userAuthId)
        .maybeSingle()
      if (data?.id_usuario) return Number(data.id_usuario)
    } catch {}
  }

  return null
}

// ── READ: Obtener prendas del vendedor autenticado ──────────────────────────
export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  pageSize = 10
): Promise<{ data: Product[]; count: number; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userAuthId = session?.user?.id
    const userEmail = session?.user?.email

    let products: Product[] = []

    // 1. Obtener prendas directamente desde Supabase catalogo.prendas usando id_usuario real
    const internalUserId = await getInternalUserId(supabase, userAuthId, userEmail)

    if (internalUserId) {
      try {
        const { data: prendasDb, error: errPrendas } = await supabase
          .schema('catalogo')
          .from('prendas')
          .select(`
            id_prenda, titulo, descripcion, precio, talla, color, genero, condicion, estado_publicacion, fecha_publicacion, id_categoria, id_marca,
            categorias!left(nombre),
            marcas!left(nombre),
            imagenes_prendas!left(url_imagen, es_principal, orden)
          `)
          .eq('id_usuario', internalUserId)
          .order('fecha_publicacion', { ascending: false })

        if (!errPrendas && prendasDb && prendasDb.length > 0) {
          products = prendasDb.map((p: any) => {
            const imgs = p.imagenes_prendas || []
            const principal = imgs.find((i: any) => i.es_principal) || imgs[0]
            const catNombre = p.categorias?.nombre || ''
            const marcaNombre = p.marcas?.nombre || ''

            let status: ProductStatus = 'draft'
            const dbStatus = (p.estado_publicacion || '').toUpperCase()
            if (dbStatus === 'DISPONIBLE') status = 'published'
            else if (dbStatus === 'VENDIDA') status = 'sold'
            else if (dbStatus === 'PAUSADA') status = 'archived'

            return {
              id: String(p.id_prenda),
              name: p.titulo || 'Sin título',
              description: p.descripcion || '',
              price: Number(p.precio) || 0,
              stock: 1,
              sku: null,
              category: catNombre,
              category_id: p.id_categoria,
              id_marca: p.id_marca,
              brand: marcaNombre,
              status,
              image_url: principal?.url_imagen || null,
              created_at: p.fecha_publicacion || new Date().toISOString(),
              updated_at: p.fecha_publicacion || new Date().toISOString(),
              size: p.talla || null,
              color: p.color || null,
              gender: p.genero || null,
              condition: p.condicion || null,
            }
          })
        }
      } catch (dbErr) {
        console.warn('Error consultando prendas en Supabase:', dbErr)
      }
    }

    // 2. Si no se obtuvieron de Supabase, consultar endpoint de la API FastAPI
    if (products.length === 0) {
      try {
        const token = await getAccessToken().catch(() => null)
        if (token) {
          const res = await fetch(`${API_BASE_URL}/api/products`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          if (res.ok) {
            const json = await res.json()
            products = (json.data || []).map((p: any) => mapFromDB(p))
          }
        }
      } catch (apiErr) {
        console.warn('Error consultando API de productos:', apiErr)
      }
    }

    // Filtros en cliente (búsqueda, estado, categoría)
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
      products = products.filter((p) => {
        const catFilter = String(filters.category)
        return (
          String(p.category_id) === catFilter ||
          (p.category && p.category.toLowerCase() === catFilter.toLowerCase())
        )
      })
    }

    // Ordenamiento
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

    // Paginación
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

// ── WRITE: Crear producto ───────────────────────────────────────────────────
export async function createProduct(
  payload: ProductInsert
): Promise<{ data: Product | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userAuthId = session?.user?.id
    const userEmail = session?.user?.email

    // 1. Obtener id_usuario interno
    const internalUserId = await getInternalUserId(supabase, userAuthId, userEmail)
    if (!internalUserId) {
      return { data: null, error: 'No se pudo identificar tu usuario vendedor. Por favor, inicia sesión nuevamente.' }
    }

    const idCat = Number(payload.category_id || payload.category) || 1
    const idMarca = Number(payload.id_marca || payload.brand) || 1
    const cond = (payload.condition?.toUpperCase() === 'NUEVO') ? 'NUEVO' : 'USADO'

    let dbStatus = 'DISPONIBLE'
    if (payload.status === 'archived' || payload.status === 'draft') dbStatus = 'PAUSADA'
    else if (payload.status === 'sold') dbStatus = 'VENDIDA'

    // Insertar directamente en catalogo.prendas
    const { data: nuevaPrenda, error: insertError } = await supabase
      .schema('catalogo')
      .from('prendas')
      .insert({
        id_usuario: internalUserId,
        id_categoria: idCat,
        id_marca: idMarca,
        titulo: payload.name.trim(),
        descripcion: payload.description?.trim() || 'Sin descripción adicional sobre la prenda.',
        precio: Number(payload.price) || 0,
        talla: payload.size || 'M',
        color: payload.color || 'Combinado',
        genero: payload.gender || 'Unisex',
        condicion: cond,
        estado_publicacion: dbStatus,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error insertando en Supabase:', insertError)
      return { data: null, error: insertError.message || 'Error al guardar la prenda en la base de datos.' }
    }

    if (!nuevaPrenda?.id_prenda) {
      return { data: null, error: 'No se pudo confirmar la creación de la prenda.' }
    }

    if (payload.image_url) {
      const { error: imgErr } = await supabase
        .schema('catalogo')
        .from('imagenes_prendas')
        .insert({
          id_prenda: nuevaPrenda.id_prenda,
          url_imagen: payload.image_url,
          es_principal: true,
          orden: 0,
        })
      if (imgErr) console.warn('Error guardando imagen en DB:', imgErr)
    }

    // 2. Sincronizar también con la API
    try {
      const token = await getAccessToken().catch(() => null)
      if (token) {
        await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: payload.name,
            description: payload.description,
            price: payload.price,
            category: idCat,
            brand: idMarca,
            image_url: payload.image_url,
            status: payload.status || 'published',
            size: payload.size ?? 'Única',
            color: payload.color ?? 'Combinado',
            gender: payload.gender ?? 'Unisex',
            condition: cond,
          }),
        })
      }
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vint:producto-actualizado'))
    }

    const createdProduct: Product = {
      id: String(nuevaPrenda.id_prenda),
      name: nuevaPrenda.titulo,
      description: nuevaPrenda.descripcion,
      price: Number(nuevaPrenda.precio) || 0,
      stock: 1,
      sku: null,
      category: String(idCat),
      category_id: idCat,
      id_marca: idMarca,
      brand: String(idMarca),
      status: payload.status || 'published',
      image_url: payload.image_url || null,
      created_at: nuevaPrenda.fecha_publicacion || new Date().toISOString(),
      updated_at: nuevaPrenda.fecha_publicacion || new Date().toISOString(),
      size: nuevaPrenda.talla,
      color: nuevaPrenda.color,
      gender: nuevaPrenda.genero,
      condition: nuevaPrenda.condicion,
    }

    return { data: createdProduct, error: null }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

// ── WRITE: Actualizar producto ──────────────────────────────────────────────
export async function updateProduct(
  id: string,
  payload: ProductUpdate
): Promise<{ data: Product | null; error: string | null }> {
  try {
    let dbStatus: string | undefined = undefined
    if (payload.status === 'published') dbStatus = 'DISPONIBLE'
    else if (payload.status === 'draft' || payload.status === 'archived') dbStatus = 'PAUSADA'
    else if (payload.status === 'sold') dbStatus = 'VENDIDA'

    // 1. Actualización directa en Supabase catalogo.prendas
    try {
      const supabase = getSupabaseClient()
      const updateData: any = {}
      if (dbStatus) updateData.estado_publicacion = dbStatus
      if (payload.name) updateData.titulo = payload.name
      if (payload.description !== undefined) updateData.descripcion = payload.description
      if (payload.price !== undefined) updateData.precio = payload.price
      if (payload.size) updateData.talla = payload.size
      if (payload.color) updateData.color = payload.color
      if (payload.gender) updateData.genero = payload.gender
      if (payload.condition) {
        updateData.condicion = payload.condition.toUpperCase() === 'NUEVO' ? 'NUEVO' : 'USADO'
      }
      if (payload.id_marca !== undefined) updateData.id_marca = Number(payload.id_marca) || payload.id_marca
      else if (payload.brand && !isNaN(Number(payload.brand))) updateData.id_marca = Number(payload.brand)
      if (payload.category_id !== undefined) updateData.id_categoria = Number(payload.category_id) || payload.category_id
      else if (payload.category && !isNaN(Number(payload.category))) updateData.id_categoria = Number(payload.category)

      if (Object.keys(updateData).length > 0) {
        await supabase
          .schema('catalogo')
          .from('prendas')
          .update(updateData)
          .eq('id_prenda', Number(id) || id)
      }

      if (payload.image_url) {
        const { data: imgExist } = await supabase
          .schema('catalogo')
          .from('imagenes_prendas')
          .select('id_imagen')
          .eq('id_prenda', Number(id) || id)
          .eq('es_principal', true)
          .maybeSingle()

        if (imgExist?.id_imagen) {
          await supabase
            .schema('catalogo')
            .from('imagenes_prendas')
            .update({ url_imagen: payload.image_url })
            .eq('id_imagen', imgExist.id_imagen)
        } else {
          await supabase
            .schema('catalogo')
            .from('imagenes_prendas')
            .insert({
              id_prenda: Number(id) || id,
              url_imagen: payload.image_url,
              es_principal: true,
              orden: 0
            })
        }
      }
    } catch (supaErr) {
      console.warn('Actualización directa Supabase:', supaErr)
    }

    // 2. Notificar a la API
    try {
      const token = await getAccessToken().catch(() => null)
      if (token) {
        await fetch(`${API_BASE_URL}/api/products`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: Number(id) || id,
            ...payload,
            category: payload.category_id || payload.category,
            brand: payload.id_marca || payload.brand,
            estado_publicacion: dbStatus,
          }),
        })
      }
    } catch {}

    return { data: null, error: null }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

// ── WRITE: Eliminar un producto ─────────────────────────────────────────────
export async function deleteProduct(
  id: string
): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    try {
      await supabase.schema('catalogo').from('imagenes_prendas').delete().eq('id_prenda', Number(id) || id)
      await supabase.schema('catalogo').from('prendas').delete().eq('id_prenda', Number(id) || id)
    } catch {}

    try {
      const token = await getAccessToken().catch(() => null)
      if (token) {
        await fetch(`${API_BASE_URL}/api/products`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: [String(id)] }),
        })
      }
    } catch {}

    return { error: null }
  } catch (err: any) {
    return { error: err.message }
  }
}

// ── WRITE: Eliminar múltiples productos ─────────────────────────────────────
export async function deleteProducts(
  ids: string[]
): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseClient()
    const numIds = ids.map(id => Number(id) || id)
    try {
      await supabase.schema('catalogo').from('imagenes_prendas').delete().in('id_prenda', numIds)
      await supabase.schema('catalogo').from('prendas').delete().in('id_prenda', numIds)
    } catch {}

    try {
      const token = await getAccessToken().catch(() => null)
      if (token) {
        await fetch(`${API_BASE_URL}/api/products`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ids }),
        })
      }
    } catch {}

    return { error: null }
  } catch (err: any) {
    return { error: err.message }
  }
}

// ── Categories & Brands fetched dynamically from Database & API ─────────────
export async function getCategories(): Promise<{ id: string; nombre: string; descripcion?: string }[]> {
  const supabase = getSupabaseClient()
  try {
    const { data: supaCats, error: supaErr } = await supabase
      .schema('catalogo')
      .from('categorias')
      .select('id_categoria, nombre, descripcion')
      .order('nombre')

    if (!supaErr && supaCats && supaCats.length > 0) {
      return supaCats.map((c: any) => ({
        id: String(c.id_categoria),
        nombre: c.nombre,
        descripcion: c.descripcion || '',
      }))
    }
  } catch {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/products/categories`)
    if (res.ok) {
      const json = await res.json()
      const list = Array.isArray(json) ? json : (json.data || [])
      if (list.length > 0) {
        return list.map((c: any) => ({
          id: String(c.id_categoria || c.id),
          nombre: c.nombre,
          descripcion: c.descripcion || '',
        }))
      }
    }
  } catch {}

  return [
    { id: '1', nombre: 'Camisetas' },
    { id: '2', nombre: 'Pantalones' },
    { id: '3', nombre: 'Vestidos' },
    { id: '4', nombre: 'Chaquetas' },
    { id: '5', nombre: 'Zapatos' },
    { id: '6', nombre: 'Accesorios' },
    { id: '8', nombre: 'Deportiva' },
    { id: '10', nombre: 'Faldas' },
    { id: '21', nombre: 'Camisas' },
    { id: '22', nombre: 'Shorts' },
  ]
}

export async function getMarcas(): Promise<{ id_marca: string; nombre: string }[]> {
  const supabase = getSupabaseClient()
  try {
    const { data: supaMarcas, error: supaErr } = await supabase
      .schema('catalogo')
      .from('marcas')
      .select('id_marca, nombre')
      .order('nombre')

    if (!supaErr && supaMarcas && supaMarcas.length > 0) {
      return supaMarcas.map((m: any) => ({
        id_marca: String(m.id_marca),
        nombre: m.nombre,
      }))
    }
  } catch {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/products/marcas`)
    if (res.ok) {
      const json = await res.json()
      const list = Array.isArray(json) ? json : (json.data || [])
      if (list.length > 0) {
        return list.map((m: any) => ({
          id_marca: String(m.id_marca || m.id),
          nombre: m.nombre,
        }))
      }
    }
  } catch {}

  return [
    { id_marca: '1', nombre: 'Nike' },
    { id_marca: '2', nombre: 'Adidas' },
    { id_marca: '3', nombre: 'Zara' },
    { id_marca: '4', nombre: 'H&M' },
    { id_marca: '5', nombre: "Levi's" },
    { id_marca: '9', nombre: 'Sin marca' },
  ]
}