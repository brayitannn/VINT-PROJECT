import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { user } = await req.json()

    const { data: prendas, error } = await supabase
      .from('catalogo.v_catalogo_publico')
      .select('id_prenda, titulo, precio, talla, condicion, vendedor, imagen_principal, categoria')
      .limit(30)

    if (error) throw new Error(error.message)

    const prompt = `Eres un asistente de moda de segunda mano. Tienes el perfil de un usuario y una lista de prendas disponibles. Tu tarea es recomendar las 4 prendas más relevantes para ese usuario.

PERFIL DEL USUARIO:
- Categorías favoritas: ${user.preferencias.categorias.join(', ')}
- Tallas: ${user.preferencias.tallas.join(', ')}
- Presupuesto máximo: $${user.preferencias.presupuesto_max.toLocaleString('es-CO')} COP
- Estilos: ${user.preferencias.estilos.join(', ')}

PRENDAS DISPONIBLES:
${JSON.stringify(prendas, null, 2)}

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin backticks, con este formato exacto:
{
  "recomendaciones": [
    {
      "id_prenda": número,
      "titulo": "string",
      "precio": número,
      "talla": "string",
      "condicion": "string",
      "vendedor": "string",
      "imagen_principal": "string",
      "categoria": "string",
      "razon": "Una frase corta explicando por qué se recomienda esta prenda"
    }
  ]
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await response.json()
    const text = aiData.content?.[0]?.text ?? '{}'
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (e: any) {
    console.error('Error en recomendaciones:', e.message)
    return NextResponse.json({ recomendaciones: [] }, { status: 500 })
  }
}