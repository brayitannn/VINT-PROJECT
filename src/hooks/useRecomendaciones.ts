import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ProductoRecomendado } from '@/types/dashboard'

export function useRecomendaciones() {
  const { user, loading: authLoading } = useAuth()
  const [recomendaciones, setRecomendaciones] = useState<ProductoRecomendado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Esperar a que Auth cargue y haya usuario
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    async function cargarRecomendaciones() {
      try {
        setLoading(true)
        setError(null)

        const preferencias = user!.user_metadata?.preferencias ?? null

        const res = await fetch('/api/recomendaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user!.id,
            preferencias,
          }),
        })
        if (!res.ok) throw new Error('Error al obtener recomendaciones')
        const data = await res.json()
        setRecomendaciones(data.recomendaciones ?? [])
      } catch (e) {
        setError('No se pudieron cargar las recomendaciones')
      } finally {
        setLoading(false)
      }
    }

    cargarRecomendaciones()
  }, [user, authLoading])

  return { recomendaciones, loading, error }
}
