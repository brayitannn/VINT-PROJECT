import { createClient } from '@/lib/supabase/client'

export interface EstadisticasVendedor {
  ingresosTotal: number
  ingresosMesAnterior: number
  prendasVendidas: number
  prendasVendidasSemana: number
  pedidosEnCurso: number
  /** Últimos 6 días de ingresos para la mini-gráfica */
  trendIngresos: number[]
}

/**
 * Consulta las estadísticas de ventas reales de un vendedor desde Supabase.
 * Requiere una tabla `pedidos` con las columnas:
 *   - vendedor_id (uuid)
 *   - total (numeric)
 *   - estado (text): 'pendiente' | 'enviado' | 'completado'
 *   - created_at (timestamptz)
 */
export async function fetchEstadisticasVendedor(
  vendedorId: string
): Promise<EstadisticasVendedor> {
  const supabase = createClient()

  const ahora = new Date()
  const inicioMesActual   = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1).toISOString()
  const finMesAnterior    = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59).toISOString()
  const hace7Dias         = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Últimos 6 días (para el trend sparkline)
  const hace6Dias = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (5 - i))
    return d.toISOString().slice(0, 10)
  })

  // ── Ingresos mes actual (necesitamos los datos completos para el trend) ──────
  const { data: pedidosMesActual } = await supabase
    .from('pedidos')
    .select('total, created_at')
    .eq('vendedor_id', vendedorId)
    .eq('estado', 'completado')
    .gte('created_at', inicioMesActual)

  // ── Ingresos mes anterior ────────────────────────────────────────────────────
  const { data: pedidosMesAnterior } = await supabase
    .from('pedidos')
    .select('total')
    .eq('vendedor_id', vendedorId)
    .eq('estado', 'completado')
    .gte('created_at', inicioMesAnterior)
    .lte('created_at', finMesAnterior)

  // ── Pedidos en curso: count-only (no descarga filas) ─────────────────────────
  const { count: countEnCurso } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .eq('vendedor_id', vendedorId)
    .in('estado', ['pendiente', 'enviado'])

  // ── Ventas de la semana: count-only ──────────────────────────────────────────
  const { count: countSemana } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true })
    .eq('vendedor_id', vendedorId)
    .eq('estado', 'completado')
    .gte('created_at', hace7Dias)

  // ── Calcular totales ─────────────────────────────────────────────────────────
  const ingresosTotal = (pedidosMesActual as Array<{ total: unknown; created_at: unknown }> ?? []).reduce(
    (sum, p) => sum + Number(p.total ?? 0), 0
  )
  const ingresosMesAnterior = (pedidosMesAnterior as Array<{ total: unknown }> ?? []).reduce(
    (sum, p) => sum + Number(p.total ?? 0), 0
  )

  // ── Mini trend: ingresos agrupados por día ───────────────────────────────────
  const trendMap: Record<string, number> = {}
  hace6Dias.forEach(d => { trendMap[d] = 0 })
  ;(pedidosMesActual as Array<{ total: unknown; created_at: unknown }> ?? []).forEach(p => {
    const createdAt = p.created_at
    if (typeof createdAt === 'string') {
      const dia = createdAt.slice(0, 10)
      if (dia in trendMap) trendMap[dia] += Number(p.total ?? 0)
    }
  })
  const trendIngresos = Object.values(trendMap)

  return {
    ingresosTotal,
    ingresosMesAnterior,
    prendasVendidas:       pedidosMesActual?.length ?? 0,
    prendasVendidasSemana: countSemana              ?? 0,
    pedidosEnCurso:        countEnCurso             ?? 0,
    trendIngresos,
  }
}
