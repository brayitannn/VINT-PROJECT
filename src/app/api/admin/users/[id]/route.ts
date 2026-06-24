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
 * DELETE /api/admin/users/[id]
 * Eliminar un usuario permanentemente
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No tienes permisos de administrador.' },
        { status: 403 }
      )
    }

    // Doble confirmación via header
    const confirmHeader = request.headers.get('x-confirm-delete')
    if (confirmHeader !== 'true') {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Debes confirmar la eliminación con el header x-confirm-delete: true.' },
        { status: 400 }
      )
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'ID de usuario inválido.' },
        { status: 400 }
      )
    }

    // 1. Buscar el id_auth_supabase del usuario
    const { data: userData, error: fetchError } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('usuarios')
      .select('id_auth_supabase, correo')
      .eq('id_usuario', userId)
      .single()

    if (fetchError || !userData) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Usuario no encontrado.' },
        { status: 404 }
      )
    }

    // No permitir que un admin se elimine a sí mismo
    if (userData.id_auth_supabase === admin.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No puedes eliminar tu propia cuenta de administrador.' },
        { status: 400 }
      )
    }

    // 2. Eliminar de la tabla seguridad.usuarios
    const { error: dbError } = await supabaseAdmin
      .schema('seguridad' as any)
      .from('usuarios')
      .delete()
      .eq('id_usuario', userId)

    if (dbError) {
      console.error('Error al eliminar usuario de la BD:', dbError)
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al eliminar de la base de datos: ' + dbError.message },
        { status: 500 }
      )
    }

    // 3. Eliminar de Supabase Auth
    if (userData.id_auth_supabase) {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        userData.id_auth_supabase
      )

      if (authDeleteError) {
        console.error('Error al eliminar de Auth:', authDeleteError)
        // No devolvemos error porque ya se borró de la BD
      }
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: `Usuario ${userData.correo} eliminado permanentemente.` }
    )
  } catch (error: any) {
    console.error('Error interno:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
