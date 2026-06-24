import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types/auth'

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
 * POST /api/admin/roles/assign
 * Asignar un rol a un usuario
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

    const { userId, roleId } = await request.json()

    if (!userId || !roleId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Debes enviar userId y roleId.' },
        { status: 400 }
      )
    }

    // Verificar que el rol exista
    const { data: rolData, error: rolError } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('roles')
      .select('id_rol, nombre')
      .eq('id_rol', roleId)
      .single()

    if (rolError || !rolData) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'El rol especificado no existe.' },
        { status: 404 }
      )
    }

    // Obtener el id_auth_supabase del usuario
    const { data: userData, error: userError } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('usuarios')
      .select('id_auth_supabase')
      .eq('id_usuario', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Usuario no encontrado.' },
        { status: 404 }
      )
    }

    // 1. Actualizar en la base de datos
    const { error: updateError } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('usuarios')
      .update({ id_rol: roleId })
      .eq('id_usuario', userId)

    if (updateError) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al asignar rol en BD: ' + updateError.message },
        { status: 500 }
      )
    }

    // 2. Sincronizar con Supabase Auth metadata
    const rolNameMap: Record<string, string> = {
      'ADMIN': 'admin',
      'VENDEDOR': 'vendedor',
      'COMPRADOR': 'comprador',
    }
    const roleName = rolNameMap[rolData.nombre] || rolData.nombre.toLowerCase()

    if (userData.id_auth_supabase) {
      await supabaseAdmin.auth.admin.updateUserById(
        userData.id_auth_supabase,
        { user_metadata: { role: roleName, id_rol: roleId } }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: `Rol ${rolData.nombre} asignado correctamente.` }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
