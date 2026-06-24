import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, PermisoDB } from '@/types/auth'

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
 * GET /api/admin/permissions
 * Listar todos los permisos disponibles
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

    const { data, error } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('permisos')
      .select('id_permiso, nombre, descripcion')
      .order('id_permiso')

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al obtener permisos: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<{ permisos: PermisoDB[] }>>(
      { success: true, message: 'Permisos obtenidos.', data: { permisos: data || [] } }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/permissions
 * Asignar permisos a un rol (reemplaza los existentes)
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

    const { roleId, permissionIds } = await request.json()

    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Debes enviar roleId y permissionIds (array).' },
        { status: 400 }
      )
    }

    // 1. Eliminar permisos actuales del rol
    const { error: deleteError } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('rol_permisos')
      .delete()
      .eq('id_rol', roleId)

    if (deleteError) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al limpiar permisos: ' + deleteError.message },
        { status: 500 }
      )
    }

    // 2. Insertar nuevos permisos
    if (permissionIds.length > 0) {
      const rows = permissionIds.map((id_permiso: number) => ({
        id_rol: roleId,
        id_permiso,
      }))

      const { error: insertError } = await supabaseAdmin
        .schema('seguridad' as any)
        .from('rol_permisos')
        .insert(rows)

      if (insertError) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: 'Error al asignar permisos: ' + insertError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: `${permissionIds.length} permiso(s) asignados al rol.` }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
