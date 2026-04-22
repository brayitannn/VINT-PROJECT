import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo, id_usuario, id_prenda, termino, categoria } = body

    if (!tipo || !id_usuario) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const admin = getAdminClient()

    const { error } = await admin.from('eventos_usuario').insert({
      tipo,
      id_usuario,
      id_prenda: id_prenda ?? null,
      termino: termino ?? null,
      categoria: categoria ?? null,
    })

    if (error) {
      // Si la tabla no existe aún, lo ignoramos silenciosamente
      if (error.code === '42P01') {
        console.warn('[track] Tabla eventos_usuario no existe aún. Ejecuta el SQL de setup.')
        return NextResponse.json({ ok: false, reason: 'table_missing' })
      }
      console.error('[track] Error:', error.message)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[track] Error inesperado:', e.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
