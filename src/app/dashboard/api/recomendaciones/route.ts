/**
 * src/app/dashboard/api/recomendaciones/route.ts
 *
 * Proxy hacia la API FastAPI de VINT para recomendaciones.
 * 
 * NOTA: La lógica real vive en api-vint/routers/recomendaciones.py
 * Este route handler solo actúa como proxy para compatibilidad con
 * cualquier llamada interna que use /dashboard/api/recomendaciones.
 * 
 * El hook useRecomendaciones llama directamente a la API FastAPI,
 * por lo que este endpoint es un fallback/proxy de seguridad.
 */
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Proxy hacia la API FastAPI
    const res = await fetch(`${API_BASE_URL}/api/recomendaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('[proxy/recomendaciones] FastAPI error:', res.status, errorData)
      return NextResponse.json({ recomendaciones: [] }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    console.error('[proxy/recomendaciones] Error de red o FastAPI no disponible:', e.message)
    return NextResponse.json({ recomendaciones: [] }, { status: 200 })
  }
}