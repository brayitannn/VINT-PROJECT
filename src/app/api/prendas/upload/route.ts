import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = (formData.get('userId') as string | null) || 'anon'

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo de imagen' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${userId}_${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let contentType = file.type || 'image/jpeg'
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'jfif') contentType = 'image/jpeg'
    else if (ext === 'png') contentType = 'image/png'
    else if (ext === 'webp') contentType = 'image/webp'

    const { data, error } = await supabase.storage
      .from('prendas')
      .upload(fileName, buffer, {
        upsert: true,
        contentType,
      })

    if (error) {
      console.error('Error subiendo imagen de prenda a Supabase Storage:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('prendas').getPublicUrl(data.path)
    const publicUrl = urlData.publicUrl

    return NextResponse.json({
      success: true,
      url: publicUrl,
    })
  } catch (err: any) {
    console.error('Error en /api/prendas/upload:', err)
    return NextResponse.json({ error: err.message || 'Error interno al procesar imagen' }, { status: 500 })
  }
}
