import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, UsuarioAdmin } from '@/types/auth'

/** Verificar que el usuario autenticado sea ADMIN */
async function verifyAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  // Buscar el rol del usuario en la base de datos
  const { data: userData } = await supabaseAdmin
    .from('usuarios')
    .select('id_rol')
    .eq('id_auth_supabase', user.id)
    .single()

  if (!userData) {
    // Intentar con esquema seguridad
    const { data: userData2 } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('usuarios')
      .select('id_rol')
      .eq('id_auth_supabase', user.id)
      .single()
    
    if (!userData2) return null

    const { data: rolData } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('roles')
      .select('nombre')
      .eq('id_rol', userData2.id_rol)
      .single()

    return rolData?.nombre === 'ADMIN' ? user : null
  }

  const { data: rolData } = await supabaseAdmin
    .from('roles')
    .select('nombre')
    .eq('id_rol', userData.id_rol)
    .single()

  return rolData?.nombre === 'ADMIN' ? user : null
}

/**
 * GET /api/admin/users
 * Listar usuarios con búsqueda, filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No tienes permisos de administrador.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const roleFilter = searchParams.get('role') || ''
    const statusFilter = searchParams.get('status') || '' // 'active' | 'inactive'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construir query con el admin client (bypassa RLS)
    let query = supabaseAdmin
      .schema('seguridad' as any)
      .from('usuarios')
      .select(`
        id_usuario,
        id_auth_supabase,
        id_rol,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        correo,
        telefono,
        fecha_registro,
        activo,
        genero,
        roles!inner ( nombre )
      `, { count: 'exact' })

    // Filtro de búsqueda por nombre o correo
    if (search) {
      query = query.or(
        `primer_nombre.ilike.%${search}%,primer_apellido.ilike.%${search}%,correo.ilike.%${search}%`
      )
    }

    // Filtro por rol
    if (roleFilter) {
      const { data: rolData } = await supabaseAdmin
        .schema('seguridad' as any)
        .from('roles')
        .select('id_rol')
        .eq('nombre', roleFilter.toUpperCase())
        .single()

      if (rolData) {
        query = query.eq('id_rol', rolData.id_rol)
      }
    }

    // Filtro por estado
    if (statusFilter === 'active') {
      query = query.eq('activo', true)
    } else if (statusFilter === 'inactive') {
      query = query.eq('activo', false)
    }

    // Paginación y orden
    query = query
      .order('fecha_registro', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error al consultar usuarios:', error)
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al consultar usuarios: ' + error.message },
        { status: 500 }
      )
    }

    // Formatear respuesta
    const usuarios: UsuarioAdmin[] = (data || []).map((u: any) => ({
      id_usuario: u.id_usuario,
      id_auth_supabase: u.id_auth_supabase,
      nombre_completo: `${u.primer_nombre} ${u.segundo_nombre || ''} ${u.primer_apellido} ${u.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim(),
      correo: u.correo,
      telefono: u.telefono,
      rol: u.roles?.nombre || 'SIN ROL',
      id_rol: u.id_rol,
      activo: u.activo,
      fecha_registro: u.fecha_registro,
      genero: u.genero,
    }))

    return NextResponse.json<ApiResponse<{ usuarios: UsuarioAdmin[]; total: number; page: number; limit: number }>>(
      {
        success: true,
        message: 'Usuarios obtenidos.',
        data: { usuarios, total: count || 0, page, limit },
      }
    )
  } catch (error: any) {
    console.error('Error interno:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users
 * Activar/desactivar un usuario
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No tienes permisos de administrador.' },
        { status: 403 }
      )
    }

    const { userId, activo } = await request.json()

    if (!userId || typeof activo !== 'boolean') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Debes enviar userId y activo (boolean).' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('usuarios')
      .update({ activo })
      .eq('id_usuario', userId)

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al actualizar usuario: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente.` }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
