import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar que el usuario esté autenticado
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'No estás autenticado.' },
        { status: 401 }
      )
    }

    // 2. Leer payload
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Debes enviar la contraseña actual y la nueva.' },
        { status: 400 }
      )
    }

    // 3. Validar fortaleza de la nueva contraseña
    if (newPassword.length < 8) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      )
    }
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'La nueva contraseña debe incluir al menos una letra mayúscula.' },
        { status: 400 }
      )
    }
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'La nueva contraseña debe incluir al menos un número.' },
        { status: 400 }
      )
    }

    // 4. Verificar contraseña actual intentando un login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'La contraseña actual es incorrecta.' },
        { status: 403 }
      )
    }

    // 5. Actualizar contraseña usando el admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Error al actualizar la contraseña: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Contraseña actualizada correctamente.' }
    )
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
