import { getSupabaseClient } from '@/lib/supabase/client'
import { API_BASE_URL } from '@/lib/api'

export interface PedidoItemInput {
  id_prenda: number
  precio: number
}

export interface DatosEnvioInput {
  nombre: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  info_adicional?: string
}

export interface Pedido {
  id: string
  id_prenda: number
  titulo_prenda: string
  imagen_prenda?: string | null
  precio: number
  total: number
  estado: string
  metodo_pago: string
  direccion_envio?: DatosEnvioInput | any
  created_at: string
  nombre_comprador?: string
}

export interface CompraResponse {
  success: boolean
  message: string
  data: {
    pedidos: Pedido[]
    total_compra: number
    cantidad_items: number
  }
}

export async function getAccessToken(): Promise<string> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error || !data?.session?.access_token) {
    throw new Error('No hay sesión activa. Por favor, inicia sesión para continuar.')
  }
  return data.session.access_token
}

/**
 * Procesa la compra simulada enviando los datos a la API FastAPI
 */
export async function procesarCompra(
  items: PedidoItemInput[],
  envio: DatosEnvioInput,
  costoEnvio: number
): Promise<CompraResponse> {
  const token = await getAccessToken()

  const response = await fetch(`${API_BASE_URL}/api/checkout/comprar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      items,
      envio,
      costo_envio: costoEnvio
    })
  })

  const resJson = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = resJson.detail || resJson.error || 'Error al procesar la compra'
    throw new Error(errorMsg)
  }

  return resJson
}

/**
 * Obtiene el historial de compras del usuario autenticado
 */
export async function getMisCompras(): Promise<Pedido[]> {
  const token = await getAccessToken()

  const response = await fetch(`${API_BASE_URL}/api/pedidos/mis-compras`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const resJson = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = resJson.detail || resJson.error || 'Error al obtener el historial de compras'
    throw new Error(errorMsg)
  }

  return resJson.data || []
}

/**
 * Obtiene el historial de ventas del vendedor autenticado
 */
export async function getMisVentas(): Promise<Pedido[]> {
  const token = await getAccessToken()

  const response = await fetch(`${API_BASE_URL}/api/pedidos/mis-ventas`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const resJson = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = resJson.detail || resJson.error || 'Error al obtener el historial de ventas'
    throw new Error(errorMsg)
  }

  return resJson.data || []
}

/**
 * Cancela una compra realizada por el comprador, pasando el pedido a 'cancelado'
 * y la prenda a 'DISPONIBLE' en el catálogo.
 */
export async function cancelarPedido(pedidoId: string): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken()

  try {
    const response = await fetch(`${API_BASE_URL}/api/pedidos/${pedidoId}/cancelar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const resJson = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errorMsg = resJson.detail || resJson.error || 'Error al cancelar la compra'
      throw new Error(errorMsg)
    }

    return resJson
  } catch (err: any) {
    // Si la API aún no tiene el endpoint implementado o falla, intentamos fallback directo con Supabase
    try {
      const supabase = getSupabaseClient()
      // Obtener el pedido para saber qué prenda cancelar
      const { data: pedido, error: errPed } = await supabase
        .from('pedidos')
        .select('id, id_prenda, estado')
        .eq('id', pedidoId)
        .single()

      if (errPed || !pedido) {
        throw new Error(err.message || 'No se pudo encontrar el pedido')
      }

      if (pedido.estado === 'cancelado') {
        throw new Error('Este pedido ya se encuentra cancelado')
      }

      // 1. Actualizar estado del pedido
      const { error: errUpPed } = await supabase
        .from('pedidos')
        .update({ estado: 'cancelado' })
        .eq('id', pedidoId)

      if (errUpPed) throw errUpPed

      // 2. Regresar la prenda a DISPONIBLE
      await supabase
        .schema('catalogo')
        .from('prendas')
        .update({ estado_publicacion: 'DISPONIBLE' })
        .eq('id_prenda', pedido.id_prenda)

      return {
        success: true,
        message: 'Compra cancelada correctamente'
      }
    } catch {
      throw new Error(err.message || 'Error al cancelar la compra')
    }
  }
}

