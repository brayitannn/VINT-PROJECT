import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Resume los últimos N eventos del usuario en texto natural
async function getResumenComportamiento(admin: ReturnType<typeof getAdminClient>, userId: string) {
  try {
    const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: eventos } = await admin
      .from('eventos_usuario')
      .select('tipo, termino, categoria, creado_en')
      .eq('id_usuario', userId)
      .gte('creado_en', hace7Dias)
      .order('creado_en', { ascending: false })
      .limit(100)

    if (!eventos || eventos.length === 0) return null

    const busquedas = eventos
      .filter(e => e.tipo === 'busqueda' && e.termino)
      .map(e => e.termino as string)
      .slice(0, 10)

    const categoriasVistas: Record<string, number> = {}
    eventos
      .filter(e => e.tipo === 'vista' && e.categoria)
      .forEach(e => {
        const cat = e.categoria as string
        categoriasVistas[cat] = (categoriasVistas[cat] ?? 0) + 1
      })

    const topCategorias = Object.entries(categoriasVistas)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, count]) => `${cat} (${count} veces)`)

    const totalFavoritos = eventos.filter(e => e.tipo === 'favorito').length
    const totalCarrito = eventos.filter(e => e.tipo === 'carrito').length

    return { busquedas, topCategorias, totalFavoritos, totalCarrito }
  } catch {
    return null
  }
}

// Obtiene los detalles de las prendas favoritas del usuario
async function getDetallesFavoritos(
  admin: ReturnType<typeof getAdminClient>,
  favoritoIds: string[]
) {
  if (!favoritoIds || favoritoIds.length === 0) return []
  try {
    const { data } = await admin
      .from('v_catalogo_publico')
      .select('id_prenda, titulo, categoria, talla, precio')
      .in('id_prenda', favoritoIds)
    return data ?? []
  } catch {
    return []
  }
}

function obtenerRecomendacionesLocales(prendas: any[], preferencias: any, favoritoIds: string[] = []) {
  const favSet = new Set(favoritoIds)
  // Excluir prendas ya en favoritos del pool principal (para no recomendar lo que ya tiene)
  const pool = prendas.filter(p => !favSet.has(p.id_prenda))

  if (!preferencias) {
    return pool.slice(0, 10).map(p => ({
      id_prenda: p.id_prenda,
      titulo: p.titulo,
      precio: Number(p.precio),
      talla: p.talla,
      condicion: p.condicion,
      vendedor: p.vendedor,
      imagen_principal: p.imagen_principal,
      categoria: p.categoria,
      razon: 'Seleccionado especialmente para ti basándonos en las últimas novedades.',
    }))
  }

  let filtradas = [...pool]

  // 1. Filtrar por talla
  if (preferencias.tallas && preferencias.tallas.length > 0) {
    const tallasSet = new Set(preferencias.tallas.map((t: string) => t.toUpperCase()))
    const preFiltro = filtradas.filter(p => p.talla && tallasSet.has(p.talla.toUpperCase()))
    if (preFiltro.length >= 5) filtradas = preFiltro
  }

  // 2. Filtrar por categoría
  if (preferencias.categorias && preferencias.categorias.length > 0) {
    const categoriasSet = new Set(preferencias.categorias.map((c: string) => c.toLowerCase()))
    const preFiltro = filtradas.filter(p => p.categoria && (
      categoriasSet.has(p.categoria.toLowerCase()) ||
      preferencias.categorias.some((c: string) => p.categoria.toLowerCase().includes(c.toLowerCase()))
    ))
    if (preFiltro.length >= 5) filtradas = preFiltro
  }

  // 3. Filtrar por presupuesto máximo
  if (preferencias.presupuesto_max) {
    const preFiltro = filtradas.filter(p => Number(p.precio) <= Number(preferencias.presupuesto_max))
    if (preFiltro.length >= 5) filtradas = preFiltro
  }

  // Tomar hasta 10
  const seleccionadas = filtradas.slice(0, 10)

  // Rellenar si faltan
  if (seleccionadas.length < 10) {
    const idsSeleccionados = new Set(seleccionadas.map(p => p.id_prenda))
    for (const p of pool) {
      if (seleccionadas.length >= 10) break
      if (!idsSeleccionados.has(p.id_prenda)) seleccionadas.push(p)
    }
  }

  return seleccionadas.map(p => {
    const razones: string[] = []
    if (preferencias.tallas?.map((t: string) => t.toUpperCase()).includes(p.talla?.toUpperCase())) {
      razones.push(`disponible en tu talla (${p.talla})`)
    }
    if (preferencias.categorias?.map((c: string) => c.toLowerCase()).includes(p.categoria?.toLowerCase())) {
      razones.push('es de tus categorías favoritas')
    }
    if (preferencias.presupuesto_max && Number(p.precio) <= Number(preferencias.presupuesto_max)) {
      razones.push('se ajusta a tu presupuesto')
    }

    return {
      id_prenda: p.id_prenda,
      titulo: p.titulo,
      precio: Number(p.precio),
      talla: p.talla,
      condicion: p.condicion,
      vendedor: p.vendedor,
      imagen_principal: p.imagen_principal,
      categoria: p.categoria,
      razon: razones.length > 0
        ? `Recomendado porque ${razones.join(' y ')}.`
        : 'Elegido especialmente para complementar tu estilo.',
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const { userId, preferencias, favoritoIds = [] } = await req.json()

    const admin = getAdminClient()

    // 1. Catálogo ampliado (60 prendas para tener variedad real)
    const { data: prendas, error } = await admin
      .from('v_catalogo_publico')
      .select('id_prenda, titulo, precio, talla, condicion, vendedor, imagen_principal, categoria')
      .limit(60)

    if (error) {
      console.error('[recomendaciones] Error consultando v_catalogo_publico:', error.message)
      return NextResponse.json({ recomendaciones: [] }, { status: 500 })
    }

    if (!prendas || prendas.length === 0) {
      return NextResponse.json({ recomendaciones: [] })
    }

    // 2. Comportamiento del usuario (últimos 7 días)
    const comportamiento = userId
      ? await getResumenComportamiento(admin, userId)
      : null

    // 3. Detalles de prendas favoritas actuales
    const detallesFavoritos = userId && favoritoIds.length > 0
      ? await getDetallesFavoritos(admin, favoritoIds)
      : []

    // 4. Construir el prompt enriquecido
    const seccionPreferencias = preferencias
      ? `PERFIL EXPLÍCITO (lo que el usuario eligió al registrarse):
- Categorías favoritas: ${preferencias.categorias?.join(', ') || 'No especificado'}
- Tallas: ${preferencias.tallas?.join(', ') || 'No especificado'}
- Presupuesto máximo: $${(preferencias.presupuesto_max || 500000).toLocaleString('es-CO')} COP
- Estilos de vida: ${preferencias.estilos?.join(', ') || 'No especificado'}`
      : 'PERFIL EXPLÍCITO: No disponible aún (usuario nuevo sin preferencias)'

    const seccionFavoritos = detallesFavoritos.length > 0
      ? `\nFAVORITOS ACTUALES DEL USUARIO (prendas que ya tiene guardadas — NO las recomiendes de nuevo, pero úsalas como señal de su gusto):
${detallesFavoritos.map(f => `- "${f.titulo}" | Categoría: ${f.categoria} | Talla: ${f.talla} | Precio: $${Number(f.precio).toLocaleString('es-CO')}`).join('\n')}

IMPORTANTE: Estas prendas revelan el gusto real del usuario. Busca en el catálogo prendas similares en estilo, categoría o precio que aún no tiene.`
      : '\nFAVORITOS ACTUALES: Sin favoritos guardados todavía.'

    const seccionComportamiento = comportamiento
      ? `\nCOMPORTAMIENTO REAL (últimos 7 días — mayor peso que el perfil explícito):
- Términos buscados: ${comportamiento.busquedas.length > 0 ? comportamiento.busquedas.join(', ') : 'Ninguno aún'}
- Categorías más vistas: ${comportamiento.topCategorias.length > 0 ? comportamiento.topCategorias.join(', ') : 'Ninguna aún'}
- Prendas agregadas a favoritos esta semana: ${comportamiento.totalFavoritos}
- Prendas agregadas al carrito esta semana: ${comportamiento.totalCarrito}

IMPORTANTE: El comportamiento real debe tener mayor peso que las preferencias declaradas. Si el usuario busca "chaquetas vintage" frecuentemente aunque su perfil diga "casual", prioriza chaquetas vintage.`
      : '\nCOMPORTAMIENTO REAL: Sin datos suficientes aún (recomienda basándote en el perfil y favoritos).'

    const prompt = `Eres el motor de recomendaciones de Vint, una plataforma de moda de segunda mano en Colombia. Analiza el perfil completo del usuario para recomendarle exactamente 10 prendas del catálogo disponible.

PRIORIDAD DE SEÑALES (de mayor a menor):
1. FAVORITOS ACTUALES — revelan el gusto real del usuario
2. COMPORTAMIENTO REAL — búsquedas y vistas recientes
3. PERFIL EXPLÍCITO — preferencias declaradas al registrarse

${seccionPreferencias}
${seccionFavoritos}
${seccionComportamiento}

CATÁLOGO DISPONIBLE:
${JSON.stringify(prendas, null, 2)}

REGLAS:
- Recomienda exactamente 10 prendas distintas
- NO recomiendes prendas que ya están en los favoritos del usuario
- Varía las categorías y precios para ofrecer diversidad
- La razón debe ser corta, personalizada y en español

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
      "razon": "Frase corta y personalizada explicando por qué esta prenda es perfecta para este usuario"
    }
  ]
}`

    // 5. Llamar a Claude si hay API key
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      console.warn('[recomendaciones] ANTHROPIC_API_KEY no configurada — usando fallback local')
      const fallbackRecs = obtenerRecomendacionesLocales(prendas, preferencias, favoritoIds)
      return NextResponse.json({ recomendaciones: fallbackRecs })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await response.json()

    if (!response.ok || !aiData.content) {
      console.warn('[recomendaciones] Anthropic falló — usando fallback local')
      const fallbackRecs = obtenerRecomendacionesLocales(prendas, preferencias, favoritoIds)
      return NextResponse.json({ recomendaciones: fallbackRecs })
    }

    const text = aiData.content?.[0]?.text ?? '{}'
    try {
      const parsed = JSON.parse(text)
      return NextResponse.json(parsed)
    } catch {
      console.warn('[recomendaciones] JSON inválido de Claude — usando fallback local')
      const fallbackRecs = obtenerRecomendacionesLocales(prendas, preferencias, favoritoIds)
      return NextResponse.json({ recomendaciones: fallbackRecs })
    }
  } catch (e: any) {
    console.error('[recomendaciones] Error inesperado:', e.message)
    try {
      const admin = getAdminClient()
      const { data: prendas } = await admin
        .from('v_catalogo_publico')
        .select('id_prenda, titulo, precio, talla, condicion, vendedor, imagen_principal, categoria')
        .limit(60)
      if (prendas && prendas.length > 0) {
        const body = await req.json().catch(() => ({}))
        const fallbackRecs = obtenerRecomendacionesLocales(prendas, body.preferencias, body.favoritoIds ?? [])
        return NextResponse.json({ recomendaciones: fallbackRecs })
      }
    } catch (dbErr) {
      console.error('[recomendaciones] Error en fallback de emergencia:', dbErr)
    }
    return NextResponse.json({ recomendaciones: [] }, { status: 500 })
  }
}
