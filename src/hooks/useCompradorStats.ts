'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

export interface CompradorStats {
  compras: number
  seguidos: number
  seguidores: number
}

/**
 * Hook que obtiene en paralelo las 3 estadísticas reales del comprador:
 *  - compras    → COUNT de filas en `pedidos` donde user_id = usuario actual
 *  - seguidos   → COUNT en `seguidores` donde id_seguidor = usuario actual
 *  - seguidores → COUNT en `seguidores` donde id_seguido  = usuario actual
 *
 * Si alguna tabla no existe todavía en Supabase, el valor cae a 0 sin romper.
 */
export function useCompradorStats(): {
  stats: CompradorStats
  loading: boolean
} {
  const { user } = useAuth()
  const [stats, setStats] = useState<CompradorStats>({ compras: 0, seguidos: 0, seguidores: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetch = async () => {
      const supabase = createClient()
      setLoading(true)

      // Ejecutamos las 3 consultas en paralelo
      const [comprasRes, seguidosRes, seguidoresRes] = await Promise.allSettled([

        // 1. Total de pedidos del comprador
        supabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),

        // 2. Cuántos usuarios sigue este comprador
        supabase
          .from('seguidores')
          .select('*', { count: 'exact', head: true })
          .eq('id_seguidor', user.id),

        // 3. Cuántos usuarios siguen a este comprador
        supabase
          .from('seguidores')
          .select('*', { count: 'exact', head: true })
          .eq('id_seguido', user.id),
      ])

      const safeCount = (res: PromiseSettledResult<any>): number => {
        if (res.status === 'rejected') return 0
        const { count, error } = res.value
        if (error) return 0
        return count ?? 0
      }

      setStats({
        compras:    safeCount(comprasRes),
        seguidos:   safeCount(seguidosRes),
        seguidores: safeCount(seguidoresRes),
      })
      setLoading(false)
    }

    fetch()
  }, [user])

  return { stats, loading }
}
