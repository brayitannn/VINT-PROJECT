import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/context/FavoritesContext'
import { ProductoRecomendado } from '@/types/dashboard'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutos

export function useRecomendaciones() {
  const { user, loading: authLoading } = useAuth()
  const { favoriteIds } = useFavorites()
  const [recomendaciones, setRecomendaciones] = useState<ProductoRecomendado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const cargarRecomendaciones = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const preferencias = user.user_metadata?.preferencias ?? null
      const favoritoIds = Array.from(favoriteIds) // Set → Array para enviarlo a la API

      const res = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          preferencias,
          favoritoIds,
        }),
      })

      if (!res.ok) throw new Error('Error al obtener recomendaciones')
      const data = await res.json()
      setRecomendaciones(data.recomendaciones ?? [])
      setLastUpdated(new Date())
    } catch {
      setError('No se pudieron cargar las recomendaciones')
    } finally {
      setLoading(false)
    }
  }, [user, favoriteIds])

  // Carga inicial y re-fetch cuando cambian los favoritos
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    cargarRecomendaciones()
  }, [user, authLoading, favoriteIds, cargarRecomendaciones])

  // Refresco automático cada 5 minutos
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      cargarRecomendaciones()
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user, cargarRecomendaciones])

  return { recomendaciones, loading, error, lastUpdated, refetch: cargarRecomendaciones }
}
