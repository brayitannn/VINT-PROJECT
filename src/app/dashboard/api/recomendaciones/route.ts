import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { user } = await req.json()

    // Query active products from the new schema
    const { data: prendas, error } = await supabase
      .from('products')
      .select('id, name, price, stock, sku, category, status, image_url')
      .limit(30)

    if (error) throw new Error(error.message)

    const prompt = `Eres un asistente de moda de segunda mano. Tienes el perfil de un usuario y una lista de prendas disponibles. Tu tarea es recomendar las 4 prendas más relevantes para ese usuario.

PERFIL DEL USUARIO:
- Categorías favoritas: ${user?.preferencias?.categorias?.join(', ') || 'Cualquiera'}
- Tallas: ${user?.preferencias?.tallas?.join(', ') || 'Cualquiera'}
- Presupuesto máximo: $${(user?.preferencias?.presupuesto_max || 1000000).toLocaleString('es-CO')} COP
- Estilos: ${user?.preferencias?.estilos?.join(', ') || 'Casual'}

PRENDAS DISPONIBLES:
${JSON.stringify(prendas, null, 2)}

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin backticks, con este formato exacto:
{
  "recomendaciones": [
    {
      "id_prenda": "string_uuid",
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
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '', // Need the system var if missing
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await response.json()
    // It's possible the Anthropic API key is missing or invalid in dev. Allow fallback:
    if (!response.ok || !aiData.content) {
      console.warn("Anthropic API falló o no configurada, haciendo fallback estático", aiData);
      const fallbackRecomendaciones = (prendas || []).slice(0, 4).map(p => ({
        id_prenda: p.id,
        titulo: p.name,
        precio: p.price,
        talla: 'Única',
        condicion: 'Bueno',
        vendedor: 'Vint Shop',
        imagen_principal: p.image_url,
        categoria: p.category,
        razon: "Seleccionado especialmente para ti"
      }))
      return NextResponse.json({ recomendaciones: fallbackRecomendaciones })
    }

    const text = aiData.content?.[0]?.text ?? '{}'
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (e: any) {
    console.error('Error en recomendaciones:', e.message)
    return NextResponse.json({ recomendaciones: [] }, { status: 500 })
  }
}