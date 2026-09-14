import { createClient } from '@/lib/supabase/client'
import { getAccessToken, getMisVentas, type Pedido } from '@/services/pedidos'
import { API_BASE_URL } from '@/lib/api'

export interface TransaccionVenta {
  id: string | number
  id_prenda?: number
  fecha: string
  comprador: string
  monto: number
  prenda: string
  imagen?: string | null
  talla?: string
  condicion?: string
  estado: string
}

export interface PedidoEnCurso {
  id: string | number
  id_prenda?: number
  prenda: string
  imagen?: string | null
  comprador: string
  estado: string
  fecha: string
  monto: number
}

export interface EstadisticasVendedor {
  ingresosTotal: number
  ingresosMesAnterior: number
  prendasVendidas: number
  prendasVendidasSemana: number
  pedidosEnCurso: number
  /** Últimos 6 días de ingresos para la mini-gráfica */
  trendIngresos: number[]
  trendLabels: string[]
  ventasRecientes: TransaccionVenta[]
  pedidosActivos: PedidoEnCurso[]
}

/**
 * Consulta las estadísticas de ventas y rendimiento comercial del vendedor.
 * 
 * 1. Prioriza los endpoints oficiales de la API (utilizados por la app móvil):
 *    - /api/vendedor/stats (vista seguridad.v_dashboard_vendedores)
 *    - /api/pedidos/mis-ventas (pedidos reales del vendedor)
 * 2. Si la API no está disponible o el usuario está sin conexión, usa fallback
 *    directo a Supabase (tabla pedidos y catálogo de prendas).
 */
export async function fetchEstadisticasVendedor(
  vendedorId: string
): Promise<EstadisticasVendedor> {
  const ahora = new Date()
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
  const finMesAnterior    = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59)
  const hace7Dias         = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Últimos 6 días para el trend sparkline y gráfica
  const hace6Dias = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (5 - i))
    return d.toISOString().slice(0, 10)
  })

  const trendLabels = hace6Dias.map(dStr => {
    const d = new Date(dStr + 'T12:00:00')
    return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
  })

  let rawPedidos: Array<{
    id?: string | number
    id_prenda?: number
    total?: number
    precio?: number
    estado?: string
    created_at?: string
    titulo_prenda?: string
    imagen_prenda?: string | null
    direccion_envio?: any
    nombre_comprador?: string
  }> = []

  let apiStatsVendidas = 0
  let apiStatsIngresos = 0

  // ── 1. Intentar endpoints de la API (igual que la app móvil) ───────────────
  try {
    const token = await getAccessToken().catch(() => null)
    if (token) {
      // Endpoint móvil: /api/vendedor/stats
      const statsPromise = fetch(`${API_BASE_URL}/api/vendedor/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async r => {
          if (!r.ok) return null
          return r.json()
        })
        .catch(() => null)

      // Endpoint pedidos: /api/pedidos/mis-ventas
      const ventasPromise = getMisVentas().catch(() => [] as Pedido[])

      const [statsRes, ventasRes] = await Promise.all([statsPromise, ventasPromise])

      if (statsRes) {
        apiStatsVendidas = Number(statsRes.vendidas ?? 0)
        apiStatsIngresos = Number(statsRes.ingresos_totales ?? 0)
      }

      if (ventasRes && Array.isArray(ventasRes) && ventasRes.length > 0) {
        rawPedidos = ventasRes
      }
    }
  } catch (err) {
    console.warn('[Estadisticas] Error consultando API, usando fallback:', err)
  }

  // ── 2. Fallback a Supabase directo si no obtuvimos pedidos de la API ────────
  const supabase = createClient()
  if (rawPedidos.length === 0) {
    try {
      const { data: pedidosDb } = await supabase
        .from('pedidos')
        .select('id, id_prenda, total, precio, estado, created_at, titulo_prenda, imagen_prenda, direccion_envio')
        .eq('vendedor_id', vendedorId)

      if (pedidosDb && pedidosDb.length > 0) {
        rawPedidos = pedidosDb
      }
    } catch (err) {
      console.warn('[Estadisticas] Error consultando pedidos en Supabase:', err)
    }
  }

  // ── 3. Fallback adicional si apiStatsVendidas sigue en 0 y no hay pedidos ───
  if (apiStatsVendidas === 0 && rawPedidos.length === 0) {
    try {
      const { data: usuario } = await supabase
        .schema('seguridad')
        .from('usuarios')
        .select('id_usuario')
        .eq('id_auth_supabase', vendedorId)
        .maybeSingle()

      if (usuario?.id_usuario) {
        const { count } = await supabase
          .schema('catalogo')
          .from('prendas')
          .select('*', { count: 'exact', head: true })
          .eq('id_usuario', usuario.id_usuario)
          .eq('estado_publicacion', 'VENDIDA')

        if (count && count > 0) {
          apiStatsVendidas = count
        }
      }
    } catch {}
  }

  // ── 4. Enriquecer con catalogo.prendas (talla, condición) ─────────────────
  const prendaIds = Array.from(new Set(rawPedidos.map(p => p.id_prenda).filter(Boolean))) as number[]
  const catalogoMap: Record<number, { talla?: string; condicion?: string; titulo?: string }> = {}

  if (prendaIds.length > 0) {
    try {
      const { data: prendasDb } = await supabase
        .schema('catalogo')
        .from('prendas')
        .select('id_prenda, titulo, talla, condicion')
        .in('id_prenda', prendaIds)

      if (prendasDb) {
        prendasDb.forEach((pr: any) => {
          catalogoMap[pr.id_prenda] = pr
        })
      }
    } catch {}
  }

  // ── 5. Procesar y calcular todas las métricas ─────────────────────────────
  const getMonto = (p: { total?: number; precio?: number }) =>
    Number(p.precio ?? p.total ?? 0)

  const formatFecha = (dStr?: string) => {
    if (!dStr) return 'Fecha no disponible'
    try {
      const d = new Date(dStr)
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dStr
    }
  }

  // Filtrar pedidos activos (no cancelados)
  const pedidosValidos = rawPedidos.filter(p => (p.estado || '').toLowerCase() !== 'cancelado')

  // Ventas completadas históricas
  const pedidosCompletados = pedidosValidos.filter(p => (p.estado || '').toLowerCase() === 'completado')

  // Pedidos en curso
  const pedidosEnCursoList = pedidosValidos.filter(p =>
    ['pendiente', 'enviado', 'en_proceso', 'pagado'].includes((p.estado || '').toLowerCase())
  )
  const pedidosEnCurso = pedidosEnCursoList.length

  // Total ingresos históricos (suma de todos los completados)
  const sumaIngresosCalculada = pedidosCompletados.reduce((sum, p) => sum + getMonto(p), 0)
  const ingresosTotal = Math.max(sumaIngresosCalculada, apiStatsIngresos)

  // Total prendas vendidas históricas
  const conteoPrendasCalculado = pedidosCompletados.length
  const prendasVendidas = Math.max(conteoPrendasCalculado, apiStatsVendidas)

  // Prendas vendidas en los últimos 7 días
  const prendasVendidasSemana = pedidosCompletados.filter(p => {
    if (!p.created_at) return false
    return new Date(p.created_at) >= hace7Dias
  }).length

  // Ingresos del mes anterior (para comparación porcentual)
  const ingresosMesAnterior = pedidosCompletados.filter(p => {
    if (!p.created_at) return false
    const d = new Date(p.created_at)
    return d >= inicioMesAnterior && d <= finMesAnterior
  }).reduce((sum, p) => sum + getMonto(p), 0)

  // Sparkline de los últimos 6 días
  const trendMap: Record<string, number> = {}
  hace6Dias.forEach(d => { trendMap[d] = 0 })
  pedidosCompletados.forEach(p => {
    if (p.created_at) {
      const dia = p.created_at.slice(0, 10)
      if (dia in trendMap) {
        trendMap[dia] += getMonto(p)
      }
    }
  })
  const trendIngresos = Object.values(trendMap)

  // Lista detallada de ventas reales completadas
  const ventasRecientes: TransaccionVenta[] = pedidosCompletados.map((p, idx) => {
    const extra = p.id_prenda ? catalogoMap[p.id_prenda] : undefined
    const nombreComprador = p.nombre_comprador || p.direccion_envio?.nombre || 'Comprador Vint'
    return {
      id: p.id ?? idx,
      id_prenda: p.id_prenda,
      fecha: formatFecha(p.created_at),
      comprador: nombreComprador,
      monto: getMonto(p),
      prenda: p.titulo_prenda || extra?.titulo || 'Prenda de moda',
      imagen: p.imagen_prenda || null,
      talla: extra?.talla || undefined,
      condicion: extra?.condicion || undefined,
      estado: p.estado || 'completado'
    }
  })

  // Lista detallada de pedidos en curso
  const pedidosActivos: PedidoEnCurso[] = pedidosEnCursoList.map((p, idx) => {
    const extra = p.id_prenda ? catalogoMap[p.id_prenda] : undefined
    const nombreComprador = p.nombre_comprador || p.direccion_envio?.nombre || 'Comprador Vint'
    const estadoTexto = p.estado === 'enviado' ? 'En tránsito' : 'Pendiente de envío'
    return {
      id: p.id ?? idx,
      id_prenda: p.id_prenda,
      prenda: p.titulo_prenda || extra?.titulo || 'Prenda en proceso',
      imagen: p.imagen_prenda || null,
      comprador: nombreComprador,
      estado: estadoTexto,
      fecha: formatFecha(p.created_at),
      monto: getMonto(p)
    }
  })

  return {
    ingresosTotal,
    ingresosMesAnterior,
    prendasVendidas,
    prendasVendidasSemana,
    pedidosEnCurso,
    trendIngresos,
    trendLabels,
    ventasRecientes,
    pedidosActivos,
  }
}
