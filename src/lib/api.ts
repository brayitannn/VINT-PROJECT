/**
 * lib/api.ts — URL base de la VINT-API (FastAPI Python).
 *
 * En desarrollo apunta a http://127.0.0.1:8000
 * En producción se lee de NEXT_PUBLIC_API_URL (ej. https://vint-api-production.up.railway.app)
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Obtiene los headers de autenticación con el JWT de Supabase.
 * Se usa en todas las llamadas a la VINT-API para que el backend
 * pueda identificar al usuario autenticado.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Dynamic import to avoid circular deps and ensure client-only code
  const { getSupabaseClient } = await import('@/lib/supabase/client')
  const supabase = getSupabaseClient()
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token || ''

  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }
}
