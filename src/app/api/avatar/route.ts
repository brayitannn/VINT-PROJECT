import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId || 'anon'}-${Date.now()}.${ext}`
    const path = fileName

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type || 'image/jpeg'
      })

    if (error) {
      console.error('Error subiendo avatar a Supabase Storage:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = urlData.publicUrl

    // Si tenemos el userId, actualizar también en seguridad.usuarios y auth
    if (userId) {
      try {
        const { error: secErr } = await supabase
          .schema('seguridad')
          .from('usuarios')
          .update({ avatar_url: publicUrl })
          .eq('id_auth_supabase', userId)

        if (secErr) {
          await supabase
            .from('usuarios')
            .update({ avatar_url: publicUrl })
            .eq('id_auth_supabase', userId)
        }
      } catch (dbErr) {
        console.warn('No se pudo actualizar avatar_url en seguridad.usuarios:', dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl
    })
  } catch (err: any) {
    console.error('Error en /api/avatar:', err)
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 })
  }
}
