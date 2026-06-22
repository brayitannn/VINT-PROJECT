import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// ── Status helpers ───────────────────────────────────────────────────────────
function uiStatusToDB(status: string): string {
  if (status === 'published') return 'DISPONIBLE'
  if (status === 'archived') return 'VENDIDA'
  return 'PAUSADA' // draft → PAUSADA
}
function dbStatusToUI(estado: string): string {
  if (estado === 'DISPONIBLE') return 'published'
  if (estado === 'VENDIDA') return 'archived'
  return 'draft' // PAUSADA → draft
}

// ── Admin clients ───────────────────────────────────────────────────────────
function getAdminClientForSchema(schema: 'catalogo' | 'seguridad' | 'public') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema },
  })
}

// ── Resolve email → id_usuario (integer) via public RPC function ─────────────
async function resolveIdUsuario(email: string): Promise<number | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const baseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await baseAdmin.rpc('get_id_usuario_por_correo', {
    p_correo: email,
  })
  if (error || data === null) {
    console.error('[resolveIdUsuario] Error:', error?.message ?? 'Not found')
    return null
  }
  return data as number
}

// ── GET /api/products  (only the authenticated seller's products) ────────────
export async function GET(req: NextRequest) {
  try {
    const serverClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await serverClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    const idUsuario = await resolveIdUsuario(user.email!)
    if (!idUsuario) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })
    }

    const catalogo = getAdminClientForSchema('catalogo')
    const { data, error } = await catalogo
      .from('prendas')
      .select(`
        id_prenda,
        titulo,
        descripcion,
        precio,
        talla,
        color,
        genero,
        condicion,
        estado_publicacion,
        fecha_publicacion,
        id_categoria,
        imagenes_prendas!left(url_imagen, es_principal)
      `)
      .eq('id_usuario', idUsuario)
      .order('fecha_publicacion', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Shape to match Product type
    const mapped = (data || []).map((p: any) => {
      const imgs: any[] = p.imagenes_prendas || []
      const principal = imgs.find((i: any) => i.es_principal) || imgs[0]
      return {
        id: String(p.id_prenda),
        name: p.titulo || '',
        description: p.descripcion || '',
        price: Number(p.precio) || 0,
        stock: 1,
        sku: '',
        category: '',
        category_id: p.id_categoria || null,
        status: dbStatusToUI(p.estado_publicacion || 'PAUSADA'),
        image_url: principal?.url_imagen || null,
        created_at: p.fecha_publicacion || new Date().toISOString(),
        updated_at: p.fecha_publicacion || new Date().toISOString(),
      }
    })

    return NextResponse.json({ data: mapped, count: mapped.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── POST /api/products ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const serverClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await serverClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesión para publicar.' },
        { status: 401 }
      )
    }

    const idUsuario = await resolveIdUsuario(user.email!)
    if (!idUsuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en el sistema.' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { name, description, price, category, image_url } = body

    if (!name || !price) {
      return NextResponse.json({ error: 'El nombre y el precio son obligatorios.' }, { status: 400 })
    }

    const catalogo = getAdminClientForSchema('catalogo')
    const { data: prenda, error: insertError } = await catalogo
      .from('prendas')
      .insert([{
        id_usuario: idUsuario,
        id_categoria: Number(category) || 1,
        id_marca: 1,
        titulo: name,
        descripcion: description || '',
        precio: Number(price),
        talla: body.size || 'Única',
        color: body.color || 'Combinado',
        genero: body.gender || 'Unisex',
        condicion: (body.condition || 'NUEVO').toUpperCase() === 'NUEVO' ? 'NUEVO' : 'USADO',
        estado_publicacion: uiStatusToDB(body.status || 'draft'),
      }])
      .select()
      .single()

    if (insertError) {
      console.error('[POST /api/products] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    if (image_url && prenda?.id_prenda) {
      await catalogo.from('imagenes_prendas').insert({
        id_prenda: prenda.id_prenda,
        url_imagen: image_url,
        es_principal: true,
        orden: 0,
      })
    }

    return NextResponse.json({ data: prenda }, { status: 201 })
  } catch (err: any) {
    console.error('[POST /api/products] Unexpected error:', err)
    return NextResponse.json({ error: err.message ?? 'Error interno del servidor' }, { status: 500 })
  }
}

// ── PATCH /api/products ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const serverClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await serverClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    const { id, ...payload } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requerido.' }, { status: 400 })

    const catalogo = getAdminClientForSchema('catalogo')
    const dbUpdate: Record<string, any> = {}
    if (payload.name) dbUpdate.titulo = payload.name
    if (payload.description !== undefined) dbUpdate.descripcion = payload.description
    if (payload.price !== undefined) dbUpdate.precio = Number(payload.price)
    
    // Mapea el estado UI al valor de BD
    if (payload.status) {
      dbUpdate.estado_publicacion = uiStatusToDB(payload.status)
    }

    const { data, error } = await catalogo
      .from('prendas')
      .update(dbUpdate)
      .eq('id_prenda', Number(id))
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── DELETE /api/products ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const serverClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await serverClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    const { ids } = await req.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs requeridos.' }, { status: 400 })
    }

    const catalogo = getAdminClientForSchema('catalogo')
    const { error } = await catalogo.from('prendas').delete().in('id_prenda', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}