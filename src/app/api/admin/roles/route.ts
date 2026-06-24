import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, RolDB } from '@/types/auth'

/** Verificar que el usuario autenticado sea ADMIN */
async function verifyAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: userData } = await supabaseAdmin
    .schema('seguridad' as any)
    .from('usuarios')
    .select('id_rol')
    .eq('id_auth_supabase', user.id)
    .single()

  if (!userData) return null

  const { data: rolData } = await supabaseAdmin
    .schema('seguridad' as any)
    .from('roles')
    .select('nombre')
    .eq('id_rol', userData.id_rol)
    .single()

  return rolData?.nombre === 'ADMIN' ? user : null
}

/**
 * GET /api/admin/roles
 * Listar todos los roles con sus permisos asociados
 */
export async function GET() {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No tienes permisos de administrador.' },
        { status: 403 }
      )
    }

    // Obtener roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('roles')
      .select('id_rol, nombre')
      .order('id_rol')

    if (rolesError) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al obtener roles: ' + rolesError.message },
        { status: 500 }
      )
    }

    // Para cada rol, obtener sus permisos
    const rolesConPermisos: RolDB[] = []
    for (const rol of roles || []) {
      const { data: permisos } = await supabaseAdmin
        .schema('seguridad' as any)
        .from('rol_permisos')
        .select('id_permiso, permisos ( id_permiso, nombre, descripcion )')
        .eq('id_rol', rol.id_rol)

      rolesConPermisos.push({
        ...rol,
        permisos: (permisos || []).map((rp: any) => rp.permisos).filter(Boolean),
      })
    }

    return NextResponse.json<ApiResponse<{ roles: RolDB[] }>>(
      { success: true, message: 'Roles obtenidos.', data: { roles: rolesConPermisos } }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/roles
 * Crear un nuevo rol
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No tienes permisos de administrador.' },
        { status: 403 }
      )
    }

    const { nombre } = await request.json()

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'El nombre del rol debe tener al menos 3 caracteres.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('roles')
      .insert({ nombre: nombre.trim().toUpperCase() })
      .select()
      .single()

    if (error) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: 'Ya existe un rol con ese nombre.' },
          { status: 409 }
        )
      }
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al crear rol: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<{ rol: RolDB }>>(
      { success: true, message: 'Rol creado correctamente.', data: { rol: data } },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/roles
 * Modificar el nombre de un rol
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

    const { id_rol, nombre } = await request.json()

    if (!id_rol || !nombre || typeof nombre !== 'string') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Debes enviar id_rol y nombre.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('roles')
      .update({ nombre: nombre.trim().toUpperCase() })
      .eq('id_rol', id_rol)

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al actualizar rol: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Rol actualizado correctamente.' }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
